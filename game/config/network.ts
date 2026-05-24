import { getClientSocketUrl } from "@/lib/config/runtime";

export const NETWORK_CONFIG = {
  SOCKET_URL: getClientSocketUrl(),

  DEFAULT_OPTIONS: {
    transports: ["websocket", "polling"] as string[],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  },

  TIMEOUTS: {
    CONNECTION: 5000, // 연결 대기 시간
    RECONNECTION: 1000, // 재연결 간격
    RESPONSE: 3000, // 응답 대기 시간
  },

  RETRY: {
    MAX_ATTEMPTS: 5, // 최대 재시도 횟수
    DELAY: 1000, // 재시도 간격 (ms)
  },
};

export const getNetworkInfo = () => {
  return {
    environment: process.env.NODE_ENV,
    socketUrl: NETWORK_CONFIG.SOCKET_URL,
    isProduction: process.env.NODE_ENV === "production",
  };
};
