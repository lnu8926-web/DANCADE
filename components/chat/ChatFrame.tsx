"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import RegisterModal from "@/components/auth/RegisterModal";
import { useToast } from "@/components/common/ToastProvider";
import { useChatSocket } from "@/hooks/chat/useChatSocket";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { GuestQuickPanel } from "./GuestQuickPanel";
import styles from "./ChatFrame.module.css";

interface ChatFrameProps {
  initialHidden?: boolean;
}

export default function ChatFrame({ initialHidden = false }: ChatFrameProps) {
  const { showToast } = useToast();
  const { messages, username, isGuestUser, isAnalyzing, sendMessage, sendQuickMessage, checkUserStatus, clearMessages } = useChatSocket();

  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(initialHidden);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const inputActivateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleChatShow = () => setIsHidden(false);
    const handleChatHide = () => setIsHidden(true);
    window.addEventListener("chat:show", handleChatShow);
    window.addEventListener("chat:hide", handleChatHide);
    return () => {
      window.removeEventListener("chat:show", handleChatShow);
      window.removeEventListener("chat:hide", handleChatHide);
    };
  }, []);

  // Enter로 입력창 활성화
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHidden || isFocused) return;
      if (e.key === "Enter" && !e.repeat) {
        setIsFocused(true);
        setTimeout(() => inputActivateRef.current?.(), 50);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHidden, isFocused]);

  // 바깥 클릭 시 포커스 해제
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (frameRef.current && !frameRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = async (message: string) => {
    if (isGuestUser) {
      showToast({ type: "info", message: "채팅은 회원가입 후 사용할 수 있습니다." });
      return;
    }
    const error = await sendMessage(message);
    if (error) {
      showToast({ type: "error", message: error });
      return;
    }
    setIsFocused(false);
  };

  const handleEsc = useCallback(() => setIsFocused(false), []);

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    checkUserStatus();
    showToast({ type: "success", message: "환영합니다! 회원가입이 완료되었습니다." });
  };

  if (isHidden) {
    return (
      <>
        <button className={styles.minimizedChatBtn} onClick={() => setIsHidden(false)} title="채팅창 표시">
          💬
        </button>
        <RegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} onSuccess={handleRegisterSuccess} />
      </>
    );
  }

  return (
    <>
      <div ref={frameRef} className={styles.chatFrame} onClick={() => setIsFocused(true)}>
        {isFocused && messages.length > 0 && (
          <div className={styles.chatToolbar}>
            <button className={styles.clearBtn} onClick={(e) => { e.stopPropagation(); clearMessages(); }} title="채팅 지우기">
              지우기
            </button>
          </div>
        )}
        <MessageList
          messages={messages}
          currentUsername={username}
          onWaveClick={() => sendQuickMessage("👋")}
          isFocused={isFocused}
        />

        {isFocused && (
          isGuestUser ? (
            <GuestQuickPanel
              onQuickMessage={sendQuickMessage}
              onRegisterClick={() => setShowRegisterModal(true)}
            />
          ) : (
            <ChatInput
              onSend={handleSendMessage}
              isAnalyzing={isAnalyzing}
              onEsc={handleEsc}
              activateRef={inputActivateRef}
            />
          )
        )}

      </div>

      <RegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} onSuccess={handleRegisterSuccess} />
    </>
  );
}
