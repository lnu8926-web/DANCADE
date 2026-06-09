import { useState, useEffect, useCallback } from "react";
import { socket } from "@/lib/socket";
import { useGuestAuth } from "@/hooks/useGuestAuth";

const ANALYZE_TIMEOUT_MS = 2500;
const MAX_CHAT_MESSAGES = 300;

interface AnalyzeResult {
  isBlocked: boolean;
  reason?: string | null;
}

export type MessageType = "chat" | "system" | "game" | "invite";

export interface ChatMessage {
  id?: string;
  username: string;
  message: string;
  timestamp: number;
  messageType?: MessageType;
}

interface UseChatSocketReturn {
  messages: ChatMessage[];
  username: string;
  isGuestUser: boolean;
  isAnalyzing: boolean;
  sendMessage: (message: string) => Promise<string | null>;
  sendQuickMessage: (emoji: string) => void;
  checkUserStatus: () => void;
  clearMessages: () => void;
}

export function useChatSocket(): UseChatSocketReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState("익명");
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { getStoredUser } = useGuestAuth();

  const checkUserStatus = useCallback(() => {
    const user = getStoredUser();
    if (user) {
      setUsername(user.nickname || "익명");
      setIsGuestUser(user.isGuest === true);
    }
  }, [getStoredUser]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    checkUserStatus();

    const handleMessage = (data: ChatMessage) => {
      setMessages((prev) => {
        const next = [...prev, data];
        if (next.length <= MAX_CHAT_MESSAGES) {
          return next;
        }

        return next.slice(next.length - MAX_CHAT_MESSAGES);
      });
    };

    socket.on("lobby:chatMessage", handleMessage);

    return () => {
      socket.off("lobby:chatMessage", handleMessage);
    };
  }, [checkUserStatus]);

  const sendMessage = async (message: string): Promise<string | null> => {
    if (!message.trim() || isAnalyzing) return null;

    setIsAnalyzing(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

      const analyzeResponse = await fetch("/api/chat/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: message }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!analyzeResponse.ok) {
        const errorData: { error?: string } = await analyzeResponse.json();
        throw new Error(errorData.error || "분석 실패");
      }

      const analysisResult: AnalyzeResult = await analyzeResponse.json();

      if (analysisResult.isBlocked) {
        return analysisResult.reason || "부적절한 내용이 감지되었습니다.";
      }

      type ChatAck =
        | { blocked: false }
        | { blocked: true; muted: false; warningsLeft: number }
        | { blocked: true; muted: true; remainingMinutes: number };

      const ackResult = await new Promise<ChatAck>((resolve) => {
        const fallback = setTimeout(() => resolve({ blocked: false }), 3000);
        socket.emit("lobby:chat", { username, message }, (res: ChatAck) => {
          clearTimeout(fallback);
          resolve(res ?? { blocked: false });
        });
      });

      if (!ackResult.blocked) return null;

      if (ackResult.muted) {
        return `욕설 반복 사용으로 ${ackResult.remainingMinutes}분간 채팅이 제한됩니다.`;
      }

      return `부적절한 내용이 포함되어 있습니다. (경고 ${ackResult.warningsLeft}회 남음)`;

    } catch (error) {
      console.error("메시지 분석 중 오류:", error);
      return "메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.";
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendQuickMessage = (emoji: string): void => {
    socket.emit("lobby:chat", { username, message: emoji });
  };

  return {
    messages,
    username,
    isGuestUser,
    isAnalyzing,
    sendMessage,
    sendQuickMessage,
    checkUserStatus,
    clearMessages: () => setMessages([]),
  };
}
