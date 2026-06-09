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

// 고빈도 이벤트(이동/애니메이션) 서버 측 전송 제한 상태
const playerRealtimeState = new Map();
const MOVE_BROADCAST_INTERVAL_MS = 50;
const ANIMATION_BROADCAST_INTERVAL_MS = 100;

// 게임별 핸들러 추가
const { registerAllHandlers } = require("./dist/handlers/registry");

// =====================================================================
// Socket.io 연결
// =====================================================================

const CHAT_MAX_LENGTH = 200;
const VIOLATION_LIMIT = 3;
const MUTE_DURATION_MS = 5 * 60 * 1000;
const BLOCKED_WORDS_REFRESH_MS = 10 * 60 * 1000;

const FALLBACK_BLOCKED_PATTERNS = [
  "씨발", "씨팔", "시발", "ㅅㅂ", "ㅆㅂ",
  "개새끼", "개새", "ㄱㅅㄲ",
  "병신", "ㅂㅅ",
  "지랄",
  "보지", "자지",
  "창녀", "걸레년",
  "씨빨", "시빨",
  "fuck", "shit", "asshole", "bastard",
];

let blockedPatternsCache = [...FALLBACK_BLOCKED_PATTERNS];

function normalizeVariants(text) {
  const base = text.toLowerCase().replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-z]/g, "");
  // 3회 이상 연속 반복 문자 제거: 씨이이이발 → 씨이발
  const deduped = base.replace(/(.)\1{2,}/g, "$1$1");
  // 자모(초성/중성) 제거 버전: 씨ㅎ발 → 씨발 (삽입된 자음 우회 처리)
  const noJamo = deduped.replace(/[ㄱ-ㅎㅏ-ㅣ]/g, "");
  return [deduped, noJamo];
}

function containsBlockedWord(text, patterns) {
  const variants = normalizeVariants(text);
  return patterns.some((w) => variants.some((v) => v.includes(w)));
}

async function loadBlockedPatterns() {
  try {
    const { data, error } = await supabase
      .from("chat_blocked_words")
      .select("word");

    if (error) throw error;

    if (data && data.length > 0) {
      blockedPatternsCache = data.map((row) => row.word);
      console.log(`[Chat] 차단 단어 ${blockedPatternsCache.length}개 로드됨`);
    }
  } catch (err) {
    console.error("[Chat] 차단 단어 로드 실패, 기본값 사용:", err.message);
  }
}

loadBlockedPatterns();
setInterval(loadBlockedPatterns, BLOCKED_WORDS_REFRESH_MS);

// socketId → { count: number, mutedUntil: number }
const chatViolations = new Map();

io.on("connection", (socket) => {
  console.log("플레이어 접속:", socket.id);

  const resetRealtimeState = () => {
    playerRealtimeState.set(socket.id, {
      lastMoveAt: 0,
      lastAnimationAt: 0,
      lastAnimationSignature: "",
    });
  };

  const removeLobbyPlayer = () => {
    const player = players.get(socket.id);
    if (!player) return;

    console.log("❌ 퇴장:", player.username);
    players.delete(socket.id);
    io.emit("players:update", Array.from(players.values()));
    resetRealtimeState();
  };

  playerRealtimeState.set(socket.id, {
    lastMoveAt: 0,
    lastAnimationAt: 0,
    lastAnimationSignature: "",
  });

  // =====================================================================
  // 채팅 이벤트
  // =====================================================================

  socket.on("lobby:chat", (data, ack) => {
    if (!data || typeof data !== "object") return;
    const { username, message } = data;

    if (!message || typeof message !== "string") return;
    const trimmed = message.trim();
    if (!trimmed || trimmed.length > CHAT_MAX_LENGTH) return;

    const now = Date.now();
    const violation = chatViolations.get(socket.id) || { count: 0, mutedUntil: 0 };

    // 뮤트 상태 확인
    if (violation.mutedUntil > now) {
      const remainingMinutes = Math.ceil((violation.mutedUntil - now) / 60000);
      if (typeof ack === "function") ack({ blocked: true, muted: true, remainingMinutes });
      return;
    }

    // 뮤트 만료 시 카운트 초기화
    if (violation.mutedUntil > 0 && violation.mutedUntil <= now) {
      chatViolations.set(socket.id, { count: 0, mutedUntil: 0 });
      violation.count = 0;
      violation.mutedUntil = 0;
    }

    const isBlocked = containsBlockedWord(trimmed, blockedPatternsCache);

    if (isBlocked) {
      const newCount = violation.count + 1;
      if (newCount >= VIOLATION_LIMIT) {
        chatViolations.set(socket.id, { count: 0, mutedUntil: now + MUTE_DURATION_MS });
        if (typeof ack === "function") ack({ blocked: true, muted: true, remainingMinutes: 5 });
      } else {
        chatViolations.set(socket.id, { count: newCount, mutedUntil: 0 });
        if (typeof ack === "function") ack({ blocked: true, muted: false, warningsLeft: VIOLATION_LIMIT - newCount });
      }
      return;
    }

    io.emit("lobby:chatMessage", {
      username,
      message: trimmed,
      timestamp: Date.now(),
    });

    if (typeof ack === "function") ack({ blocked: false });
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
    removeLobbyPlayer();

    playerRealtimeState.delete(socket.id);
    chatViolations.delete(socket.id);

    // ------------------------------- 게임별 방 정리
    // omokDisconnectHandler.handleDisconnect();
    // pingPongDisconnectHandler.handleDisconnect();
    gameHandlers.handleDisconnect();
  });

  // =====================================================================
  // 로비 이벤트
  // =====================================================================

  socket.on("player:leave", () => {
    removeLobbyPlayer();
  });

  socket.on("player:join", (data) => {
    const { userId, username, gender, avatarId, customization, x, y } = data;

    if (!playerRealtimeState.has(socket.id)) {
      resetRealtimeState();
    }

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
    const realtimeState = playerRealtimeState.get(socket.id);
    const now = Date.now();

    if (player) {
      player.x = x;
      player.y = y;

      if (
        realtimeState &&
        now - realtimeState.lastMoveAt < MOVE_BROADCAST_INTERVAL_MS
      ) {
        return;
      }

      if (realtimeState) {
        realtimeState.lastMoveAt = now;
      }

      socket.broadcast.emit("player:moved", { socketId: socket.id, x, y });
    }
  });

  socket.on("player:animation", (data) => {
    const { direction, isMoving } = data;
    const player = players.get(socket.id);
    const realtimeState = playerRealtimeState.get(socket.id);
    const now = Date.now();

    if (player) {
      player.direction = direction;
      player.isMoving = isMoving;

      const animationSignature = `${direction}:${isMoving ? "1" : "0"}`;
      const isTooFrequent =
        realtimeState &&
        now - realtimeState.lastAnimationAt < ANIMATION_BROADCAST_INTERVAL_MS;
      const isUnchanged =
        realtimeState &&
        realtimeState.lastAnimationSignature === animationSignature;

      if (isTooFrequent && isUnchanged) {
        return;
      }

      if (realtimeState) {
        realtimeState.lastAnimationAt = now;
        realtimeState.lastAnimationSignature = animationSignature;
      }

      socket.broadcast.emit("player:animationUpdate", {
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
