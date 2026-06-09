"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  showBackToGame?: boolean;
  rightSlot?: React.ReactNode;
}

export default function Header({
  showBackToGame = true,
  rightSlot,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="absolute top-15 right-2 z-50 flex items-center gap-4">
      {showBackToGame && (
        <button
          onClick={() => router.push("/game")}
          className="
            px-3 py-1.5
            text-sm font-semibold
            bg-black/60 text-white
            border border-(--color-cyan)/60
            hover:bg-(--color-cyan) hover:text-black
            transition
          "
        >
          ← GAME
        </button>
      )}

      {rightSlot}

    </header>
  );
}
