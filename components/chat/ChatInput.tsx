import { useState, useRef, useEffect } from "react";
import styles from "./ChatFrame.module.css";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isAnalyzing: boolean;
  onEsc?: () => void;
  activateRef?: React.RefObject<(() => void) | null>;
}

const EMOJI_OPTIONS = ["😀", "😂", "😍", "🥰", "😎", "🤔", "😅", "😇"];

export function ChatInput({ onSend, isAnalyzing, onEsc, activateRef }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activateRef) activateRef.current = () => inputRef.current?.focus();
    return () => { if (activateRef) activateRef.current = null; };
  }, [activateRef]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await onSend(inputValue);
    setInputValue("");
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      onEsc?.();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const handleFocus = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("game:input-locked"));
    }
  };

  const handleBlur = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("game:input-unlocked"));
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className={styles.inputContainer}>
      <div className={styles.emojiPickerContainer} ref={emojiPickerRef}>
        <button
          className={styles.emojiPickerBtn}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="이모지 추가"
        >
          😊
        </button>
        {showEmojiPicker && (
          <div className={styles.emojiPanel}>
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                className={styles.emojiOption}
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="바르고 고운말을 씁시다"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={isAnalyzing}
        />

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          onClick={handleSend}
          style={{
            cursor: isAnalyzing ? "not-allowed" : "pointer",
            opacity: isAnalyzing ? 0.5 : 1,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 20H8V18H10V20ZM20 16H8V18H6V16H4V14H6V12H8V14H18V4H20V16ZM10 12H8V10H10V12Z"
            fill="white"
            fillOpacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
}
