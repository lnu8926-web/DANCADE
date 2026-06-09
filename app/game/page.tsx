"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import Inventory from "@/components/inventory/Inventory";
import ChatFrame from "@/components/chat/ChatFrame";
import ShopOverlay from "@/components/shop/ShopOverlay";
import { useGuestAuth } from "@/hooks/useGuestAuth";

const PhaserGame = dynamic(() => import("@/components/game/PhaserGame"), {
  ssr: false,
});

export default function GamePage() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const { getStoredUser } = useGuestAuth();

  useEffect(() => {
    const user = getStoredUser();
    setNickname(user?.nickname ?? null);

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [getStoredUser]);

  useEffect(() => {
    const handleShopOpen = () => setIsShopOpen(true);
    window.addEventListener("shop:open", handleShopOpen);
    return () => window.removeEventListener("shop:open", handleShopOpen);
  }, []);

  const handleShopClose = () => {
    setIsShopOpen(false);
    window.dispatchEvent(new CustomEvent("shop:closed"));
  };

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
          <Inventory />
        </div>
      </main>

      <div className="fixed bottom-8 left-8 z-50">
        <ChatFrame initialHidden />
      </div>

      {isShopOpen && (
        <div className="fixed inset-0 z-100 bg-black/70 flex items-center justify-center p-6">
          <div className="w-full max-w-[1400px] max-h-[90vh] overflow-auto">
            <ShopOverlay onClose={handleShopClose} />
          </div>
        </div>
      )}
    </div>
  );
}
