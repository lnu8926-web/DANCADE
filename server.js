require("dotenv").config({ path: ".env.local" });
require("dotenv").config(); // Fallback to .env if needed

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
}

// ===================================================================
// ===================================================================

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

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

const app = express();
const server = http.createServer(app);
const ALLOWED_ORIGINS = parseAllowedOrigins(process.env.CORS_ORIGINS);
const corsOptions = {
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST"],
  credentials: true,
};

const io = socketIo(server, {
  cors: corsOptions,
  transports: ["websocket"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors(corsOptions));
app.use(express.json());

// ===================================================================
// ===================================================================

// 소켓 연결 유지, 방 만들기/참가/나가기 같은 [방 관리] 세팅
// const baseGameHandler = require("./dist/handlers/base/BaseGameHandler").default;

// 공유 데이터
const players = new Map();
const rooms = new Map();

// 게임별 핸들러 추가
const { registerAllHandlers } = require("./dist/handlers/registry");

// =====================================================================
// Socket.io 연결
// =====================================================================

io.on("connection", (socket) => {
  console.log("플레이어 접속:", socket.id);

  // =====================================================================
  // 채팅 이벤트
  // =====================================================================

  socket.on("lobby:chat", (data) => {
    const { username, message } = data;

    // 로비 전체에 브로드캐스트
    io.emit("lobby:chatMessage", {
      username,
      message,
      timestamp: Date.now(),
    });
  });

  // =====================================================================
  // 게임별 핸들러 등록
  // =====================================================================

  // 1. 오목
  // 공통으로 생성할 매니저 인스턴스가 생성되는 baseGameHandler 등록
  // const omokDisconnectHandler = baseGameHandler(io, socket, rooms, "omok", {
  //   maxPlayers: 2, // 오목은 2명
  //   minPlayers: 2, // 최소 2명
  //   autoStart: false, // 수동 시작
  // });
  // // 오목용 omokHandler 등록
  // omokHandler(io, socket, rooms, supabase);

  const gameHandlers = registerAllHandlers(io, socket, rooms, supabase);

  // =====================================================================
  // 연결 해제
  // =====================================================================

  socket.on("disconnect", () => {
    // ------------------------------- 로비 플레이어 정리
    const player = players.get(socket.id);
    if (player) {
      console.log("❌ 퇴장:", player.username);
      players.delete(socket.id);
      io.emit("players:update", Array.from(players.values()));
    }

    // ------------------------------- 게임별 방 정리
    // omokDisconnectHandler.handleDisconnect();
    // pingPongDisconnectHandler.handleDisconnect();
    gameHandlers.handleDisconnect();
  });

  // =====================================================================
  // 로비 이벤트
  // =====================================================================

  socket.on("player:join", (data) => {
    const { userId, username, gender, avatarId, customization, x, y } = data;

    players.set(socket.id, {
      socketId: socket.id,
      userId,
      username,
      gender,
      avatarId,
      customization,
      x,
      y,
      joinedAt: Date.now(),
    });

    console.log("👤 입장:", username);
    io.emit("players:update", Array.from(players.values()));
  });

  socket.on("player:move", (data) => {
    const { x, y } = data;
    const player = players.get(socket.id);

    if (player) {
      player.x = x;
      player.y = y;
      io.emit("player:moved", { socketId: socket.id, x, y });
    }
  });

  socket.on("player:animation", (data) => {
    const { direction, isMoving } = data;
    const player = players.get(socket.id);

    if (player) {
      player.direction = direction;
      player.isMoving = isMoving;
      io.emit("player:animationUpdate", {
        socketId: socket.id,
        direction,
        isMoving,
      });
    }
  });
});

// =====================================================================
// REST API
// =====================================================================

app.post("/api/player/save", (req, res) => {
  const { userId, x, y } = req.body;
  console.log("💾 플레이어 저장:", userId, x, y);
  res.json({ success: true });
});

app.get("/api/rooms/:gameType", async (req, res) => {
  try {
    const { gameType } = req.params;

    // Map의 Array.from(rooms.values()) 대신 await rooms.values() 사용
    const allRooms = await rooms.values();

    const roomList = allRooms
      .filter(
        (room) =>
          room.gameType === gameType &&
          room.status === "waiting" &&
          !room.isPrivate
      )
      .map((room) => ({
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
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
