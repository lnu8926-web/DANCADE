require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require('path');

const DEFAULT_ORIGINS = ["http://localhost:3000"];
const DEFAULT_SERVER_PORT = 3001;

function parseAllowedOrigins(value) {
  if (!value) return DEFAULT_ORIGINS;

  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : DEFAULT_ORIGINS;
}

function resolveServerPort() {
  return (
    process.env.SOCKET_SERVER_PORT ||
    process.env.SERVER_PORT ||
    process.env.PORT ||
    DEFAULT_SERVER_PORT
  );
}

const { createClient: createRedisClient } = require('redis');
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
const { createAdapter } = require("@socket.io/redis-adapter");

const app = express();
const server = http.createServer(app);

// 핸들러 대소문자 및 경로 주의 (실제 파일명과 일치해야 함)
const baseGameHandler = require(path.join(__dirname, "handlers", "base", "BaseGameHandler"));
const omokHandler = require(path.join(__dirname, "handlers", "games", "omok", "OmokHandler"));

// =====================================================================
// [1] Redis 설정
// =====================================================================
const REDIS_HOST = "172.31.31.157";
const REDIS_PASSWORD = "dandadan";

const pubClient = createRedisClient({ 
  url: `redis://${REDIS_HOST}:6379`,
  password: REDIS_PASSWORD 
});
const subClient = pubClient.duplicate();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

// Redis 연결
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log("✅ Redis Adapter connected");
}).catch(err => {
  console.error("❌ Redis Connection Error:", err);
});

// =====================================================================
// [2] Rooms Redis 어댑터 (기존 Map() 포맷 유지)
// =====================================================================
const rooms = {
  // 1. rooms.get(id)
  get: async (roomId) => {
    const data = await pubClient.hGet("global_rooms", roomId);
    return data ? JSON.parse(data) : null;
  },
  // 2. rooms.set(id, data)
  set: async (roomId, roomData) => {
    await pubClient.hSet("global_rooms", roomId, JSON.stringify(roomData));
    return rooms; // Map.set은 자기 자신을 반환함
  },
  // 3. rooms.delete(id)
  delete: async (roomId) => {
    return await pubClient.hDel("global_rooms", roomId);
  },
  // 4. rooms.values() -> Array.from(rooms.values()) 대신 사용 가능하도록 배열 반환
  values: async () => {
    const allData = await pubClient.hGetAll("global_rooms");
    return Object.values(allData).map(val => JSON.parse(val));
  },
  // 5. rooms.forEach((val, key) => { ... })
  forEach: async (callback) => {
    const allData = await pubClient.hGetAll("global_rooms");
    for (const [key, value] of Object.entries(allData)) {
      callback(JSON.parse(value), key);
    }
  },
  // 6. 추가: rooms.has(id)
  has: async (roomId) => {
    return await pubClient.hExists("global_rooms", roomId);
  }
};

// =====================================================================
// [3] Socket.io 설정
// =====================================================================
const ALLOWED_ORIGINS = parseAllowedOrigins(process.env.CORS_ORIGINS);
const corsOptions = {
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST"],
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => res.status(200).send("ok"));

// =====================================================================
// Socket.io 연결 로직
// =====================================================================
io.on("connection", (socket) => {

  // 오목 핸들러 등록
  const omokDisconnectHandler = baseGameHandler(io, socket, rooms, "omok", {
    maxPlayers: 2,
    minPlayers: 2,
    autoStart: false,
  });
  omokHandler(io, socket, rooms, supabase);

  // player:join 등 이벤트 처리
  socket.on("player:join", async (data) => {
    const { userId, username, gender, avatarId, customization, x, y } = data;
    const playerData = { socketId: socket.id, userId, username, gender, avatarId, customization, x, y, joinedAt: Date.now() };

    await pubClient.hSet("global_players", socket.id, JSON.stringify(playerData));

    const allPlayersData = await pubClient.hGetAll("global_players");
    const allPlayers = Object.values(allPlayersData).map(p => JSON.parse(p));

    io.emit("players:update", allPlayers);
    io.emit("createNotice", { content: `${username}님 환영합니다` });
  });

  socket.on("disconnect", async () => {
    await pubClient.hDel("global_players", socket.id);
    
    const allPlayersData = await pubClient.hGetAll("global_players");
    const allPlayers = Object.values(allPlayersData).map(p => JSON.parse(p));
    io.emit("players:update", allPlayers);
    
    if (omokDisconnectHandler && omokDisconnectHandler.handleDisconnect) {
        // 내부에서 rooms.get/set 사용 시 비동기 처리가 되어야 함
        await omokDisconnectHandler.handleDisconnect();
    }
    console.log(`❌ 퇴장: ${socket.id}`);
  });

  socket.on("player:move", async (data) => {
    const { x, y } = data;
    const rawData = await pubClient.hGet("global_players", socket.id);
    if (rawData) {
      const player = JSON.parse(rawData);
      player.x = x; player.y = y;
      await pubClient.hSet("global_players", socket.id, JSON.stringify(player));
      socket.broadcast.emit("player:moved", { socketId: socket.id, x, y });
    }
  });

  socket.on("player:animation", async (data) => {
    const { direction, isMoving } = data;

    try {
      // 1. Redis에서 현재 플레이어 데이터 가져오기
      const rawData = await pubClient.hGet("global_players", socket.id);
      
      if (rawData) {
        const player = JSON.parse(rawData);

        // 2. 데이터 업데이트
        player.direction = direction;
        player.isMoving = isMoving;

        // 3. 업데이트된 데이터를 다시 Redis에 저장
        // (나중에 새로 접속한 사람이 이 상태를 볼 수 있게 하기 위함)
        await pubClient.hSet("global_players", socket.id, JSON.stringify(player));

        // 4. 모든 클라이언트(다른 프로세스 포함)에 애니메이션 상태 전송
        io.emit("player:animationUpdate", {
          socketId: socket.id,
          direction,
          isMoving,
        });
      }
    } catch (err) {
      console.error("애니메이션 업데이트 에러:", err);
    }
  });
});

// =====================================================================
// [4] API 서버 - 방 목록 조회 (Map 포맷 대응)
// =====================================================================
app.get("/api/rooms/:gameType", async (req, res) => {
  try {
    const { gameType } = req.params;
    
    // Map의 Array.from(rooms.values()) 대신 await rooms.values() 사용
    const allRooms = await rooms.values();

    const roomList = allRooms
      .filter(room => room.gameType === gameType && room.status === "waiting" && !room.isPrivate)
      .map(room => ({
        roomId: room.roomId,
        roomName: room.roomName,
        hostUsername: room.players[0]?.username,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
      }));
      
    res.json({ rooms: roomList });
  } catch (err) {
    console.error("방 목록 조회 에러:", err);
    res.status(500).json({ error: "조회 중 오류 발생" });
  }
});

const PORT = resolveServerPort(); 
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});