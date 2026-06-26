import type { ReactNode } from "react";

interface StoryCanvasProps {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light" | "transparent";
}

export function StoryCanvas({
  children,
  className = "",
  tone = "dark",
}: StoryCanvasProps) {
  const toneClass =
    tone === "light"
      ? "bg-white text-black"
      : tone === "transparent"
        ? "bg-transparent"
        : "bg-[#1a1a2e] text-white";

  return (
    <div className={`min-w-[360px] p-6 font-neo ${toneClass} ${className}`}>
      {children}
    </div>
  );
}
