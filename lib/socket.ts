// lib/socket.ts
import { io } from "socket.io-client";
import { getClientSocketUrl } from "@/lib/config/runtime";

// Socket.io 클라이언트 인스턴스 생성
const socketUrl = getClientSocketUrl();
const isProduction = process.env.NODE_ENV === "production";
const socketTransports: Array<"websocket" | "polling"> = isProduction
  ? ["websocket"]
  : ["websocket", "polling"];

export const socket = io(socketUrl, {
  autoConnect: false, // ✅ 기본은 연결 안 함 (멀티플레이 게임에서만 수동 연결)
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: 10,
  withCredentials: true,
  transports: socketTransports,
});

socket.on("reconnect_failed", () => {
  console.error("🔴 Socket 재연결 시도 횟수 초과 - 페이지 새로고침이 필요합니다.");
});

socket.on("reconnect", (attempt: number) => {
  console.log(`✅ Socket 재연결 성공 (${attempt}번째 시도)`);
});

// 연결 상태 로깅 (개발 시 유용)
socket.on("connect", () => {
  console.log("✅ Socket 연결됨:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket 연결 끊김");
});

socket.on("connect_error", (error) => {
  console.error("🔴 Socket 연결 오류:", error);
});
