import { useRef, useEffect } from "react";
import styles from "./ChatFrame.module.css";
import type { ChatMessage } from "@/hooks/chat/useChatSocket";

interface MessageListProps {
  messages: ChatMessage[];
  currentUsername: string;
  onWaveClick: () => void;
  isFocused: boolean;
}

export function MessageList({
  messages,
  currentUsername,
  onWaveClick,
  isFocused,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} onClick={onWaveClick}>
            👋
          </div>
          <div className={styles.emptyText}>
            손을 눌러서 사람들에게 인사하세요!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.messagesContainer} ${isFocused ? styles.focused : ""}`}>
      {messages.map((msg, idx) => {
        const messageClass = getMessageClass(msg, currentUsername);

        return (
          <div key={msg.id || idx} className={messageClass}>
            {msg.messageType !== "system" && (
              <span className={styles.author}>{msg.username}</span>
            )}
            <span className={styles.content}>{msg.message}</span>
            <span className={styles.timestamp}>
              {formatTimestamp(msg.timestamp)}
            </span>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

function getMessageClass(msg: ChatMessage, currentUsername: string): string {
  if (msg.messageType === "system") {
    return styles.messageSystem;
  }
  if (msg.messageType === "game") {
    return styles.messageGame;
  }
  if (msg.username === currentUsername) {
    return styles.messageOwn;
  }
  return styles.message;
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
