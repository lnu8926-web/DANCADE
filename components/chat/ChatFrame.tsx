"use client";

import { useState, useEffect } from "react";
import RegisterModal from "@/components/auth/RegisterModal";
import { useToast } from "@/components/common/ToastProvider";
import { useChatSocket } from "@/hooks/chat/useChatSocket";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { GuestQuickPanel } from "./GuestQuickPanel";
import styles from "./ChatFrame.module.css";

interface ChatFrameProps {
  onClose?: () => void;
  initialHidden?: boolean;
}

export default function ChatFrame({
  onClose,
  initialHidden = false,
}: ChatFrameProps) {
  const { showToast } = useToast();

  const {
    messages,
    username,
    isGuestUser,
    isAnalyzing,
    sendMessage,
    sendQuickMessage,
    checkUserStatus,
  } = useChatSocket();

  const [isFullHeight, setIsFullHeight] = useState(false);
  const [isHidden, setIsHidden] = useState(initialHidden);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  const handleSendMessage = async (message: string) => {
    if (isGuestUser) {
      showToast({ type: "info", message: "채팅은 회원가입 후 사용할 수 있습니다." });
      return;
    }
    await sendMessage(message);
  };

  const handleWaveClick = () => {
    sendQuickMessage("👋");
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    checkUserStatus();
    showToast({
      type: "success",
      message: "환영합니다! 회원가입이 완료되었습니다.",
    });
  };

  return (
    <>
      <div
        className={styles.chatFrame}
        style={{
          height: isFullHeight ? "calc(100vh - 50px)" : "415px",
          display: isHidden ? "none" : "flex",
        }}
      >
        <ChatHeader
          isFullHeight={isFullHeight}
          onToggleHeight={() => setIsFullHeight(!isFullHeight)}
          onHide={() => setIsHidden(true)}
          onClose={onClose}
        />

        <MessageList
          messages={messages}
          currentUsername={username}
          onWaveClick={handleWaveClick}
        />

        {isGuestUser ? (
          <GuestQuickPanel
            onQuickMessage={sendQuickMessage}
            onRegisterClick={() => setShowRegisterModal(true)}
          />
        ) : (
          <ChatInput onSend={handleSendMessage} isAnalyzing={isAnalyzing} />
        )}
      </div>

      {isHidden && (
        <button
          className={styles.minimizedChatBtn}
          onClick={() => setIsHidden(false)}
          title="채팅창 표시"
        >
          💬
        </button>
      )}

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleRegisterSuccess}
      />
    </>
  );
}

interface ChatHeaderProps {
  isFullHeight: boolean;
  onToggleHeight: () => void;
  onHide: () => void;
  onClose?: () => void;
}

function ChatHeader({
  isFullHeight,
  onToggleHeight,
  onHide,
  onClose,
}: ChatHeaderProps) {
  return (
    <div className={styles.header}>
      <span className={styles.title}>채팅</span>
      <div className={styles.headerButtons}>
        <button
          onClick={onToggleHeight}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          title={isFullHeight ? "원래 크기" : "전체 확대"}
        >
          <img src="/assets/ui/chevrons-vertical.png" alt="expand" />
        </button>
        <button
          onClick={onHide}
          className={styles.hideBtn}
          title="채팅창 숨기기"
        >
          −
        </button>
      </div>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
}
