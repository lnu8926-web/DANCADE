"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import Inventory from "@/components/inventory/Inventory";
import ChatFrame from "@/components/chat/ChatFrame";
import { useGuestAuth } from "@/hooks/useGuestAuth";

const PhaserGame = dynamic(() => import("@/components/game/PhaserGame"), {
  ssr: false,
});

export default function GamePage() {
  const [nickname, setNickname] = useState<string | null>(null);
  const { getStoredUser } = useGuestAuth();

  useEffect(() => {
    const user = getStoredUser();
    setNickname(user?.nickname ?? "");

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [getStoredUser]);

  return (
    <div className="min-h-screen overflow-hidden">
      <main className="container mx-auto px-4">
        {nickname && (
          <div
            className="text-white text-right mb-4 absolute top-10 z-10 right-10"
            suppressHydrationWarning
          >
            환영합니다, <strong>{nickname}</strong>님! 🎮
          </div>
        )}
        <div className="flex justify-center mb-8">
          <PhaserGame />
          {/* 인벤토리 컴포넌트 추가*/}
          <Inventory />
        </div>
      </main>

      {/* 채팅 오버레이 */}
      <div className="fixed bottom-8 left-8 z-50">
        <ChatFrame />
      </div>
    </div>
  );
}
