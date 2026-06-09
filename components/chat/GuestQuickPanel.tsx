import styles from "./ChatFrame.module.css";

interface GuestQuickPanelProps {
  onQuickMessage: (message: string) => void;
  onRegisterClick: () => void;
}

const QUICK_MESSAGES = [
  { emoji: "👋", title: "인사" },
  { emoji: "👍", title: "좋아요" },
  { emoji: "❤️", title: "좋아합니다" },
  { emoji: "😂", title: "웃음" },
  { emoji: "🎉", title: "축하" },
];

export function GuestQuickPanel({
  onQuickMessage,
  onRegisterClick,
}: GuestQuickPanelProps) {
  return (
    <div className={styles.guestPanel}>
      {QUICK_MESSAGES.map(({ emoji, title }) => (
        <button
          key={emoji}
          className={styles.quickMessageBtn}
          onClick={() => onQuickMessage(emoji)}
          title={title}
        >
          {emoji}
        </button>
      ))}
      <div className={styles.guestDivider} />
      <button className={styles.guestRegisterBtn} onClick={onRegisterClick}>
        회원가입으로 채팅하기 →
      </button>
    </div>
  );
}
