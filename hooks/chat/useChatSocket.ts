import { useState, useEffect, useCallback } from "react";
import { socket } from "@/lib/socket";
import { useGuestAuth } from "@/hooks/useGuestAuth";

const ANALYZE_TIMEOUT_MS = 2500;

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
  sendMessage: (message: string) => Promise<void>;
  sendQuickMessage: (emoji: string) => void;
  checkUserStatus: () => void;
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
      setMessages((prev) => [...prev, data]);
    };

    socket.on("lobby:chatMessage", handleMessage);

    return () => {
      socket.off("lobby:chatMessage", handleMessage);
    };
  }, [checkUserStatus]);

  const sendMessage = async (message: string): Promise<void> => {
    if (isGuestUser) {
      alert("채팅은 회원가입 후 사용할 수 있습니다.");
      return;
    }

    if (!message.trim() || isAnalyzing) {
      return;
    }

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
        alert(analysisResult.reason || "부적절한 내용이 감지되었습니다.");
        return;
      }

      // 소켓으로 전송
      socket.emit("lobby:chat", { username, message });
    } catch (error) {
      console.error("메시지 분석 중 오류:", error);
      socket.emit("lobby:chat", { username, message });
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
  };
}
