import type { ChatMessage } from "@/hooks/chat/useChatSocket";

const now = new Date("2026-06-26T12:00:00+09:00").getTime();

export const mockChatMessages: ChatMessage[] = [
  {
    id: "system-1",
    username: "system",
    message: "새로운 플레이어가 입장했습니다.",
    timestamp: now - 180000,
    messageType: "system",
  },
  {
    id: "chat-1",
    username: "DANA",
    message: "오목 한 판 하실 분?",
    timestamp: now - 120000,
    messageType: "chat",
  },
  {
    id: "chat-2",
    username: "PIXEL",
    message: "저요!",
    timestamp: now - 60000,
    messageType: "chat",
  },
  {
    id: "game-1",
    username: "game",
    message: "PINGPONG 매칭이 시작되었습니다.",
    timestamp: now,
    messageType: "game",
  },
];
