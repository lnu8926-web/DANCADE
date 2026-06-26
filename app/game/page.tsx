"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import Inventory from "@/components/inventory/Inventory";
import ChatFrame from "@/components/chat/ChatFrame";
import ShopOverlay from "@/components/shop/ShopOverlay";
import RankingBoard from "@/components/ranking/RankingBoard";
import Window from "@/components/common/Window";
import { useGuestAuth } from "@/hooks/useGuestAuth";

const PhaserGame = dynamic(() => import("@/components/game/PhaserGame"), {
  ssr: false,
});

export default function GamePage() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopMounted, setShopMounted] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [rankingMounted, setRankingMounted] = useState(false);
  const [rankingGameType, setRankingGameType] = useState("omok");
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
    const handleShopOpen = () => {
      setShopMounted(true);
      setIsShopOpen(true);
    };
    window.addEventListener("shop:open", handleShopOpen);
    return () => window.removeEventListener("shop:open", handleShopOpen);
  }, []);

  useEffect(() => {
    const handleRankingOpen = () => {
      setRankingMounted(true);
      setIsRankingOpen(true);
    };
    window.addEventListener("ranking:open", handleRankingOpen);
    return () => window.removeEventListener("ranking:open", handleRankingOpen);
  }, []);

  const handleShopClose = () => {
    setIsShopOpen(false);
    window.dispatchEvent(new CustomEvent("shop:closed"));
  };

  const handleRankingClose = () => {
    setIsRankingOpen(false);
    window.dispatchEvent(new CustomEvent("ranking:closed"));
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

      {shopMounted && (
        <div className={`fixed inset-0 z-100 bg-black/70 flex items-center justify-center p-6 transition-opacity duration-200 ${isShopOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <div className="w-full max-w-[900px]">
            <ShopOverlay onClose={handleShopClose} />
          </div>
        </div>
      )}

      {rankingMounted && (
        <div className={`fixed inset-0 z-100 bg-black/70 flex items-center justify-center p-6 transition-opacity duration-200 ${isRankingOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <div className="w-full max-w-[520px]">
            <Window title="RANKING" variant="overlay" onClose={handleRankingClose} showMaximize={false}>
              <div className="flex gap-2 mb-4">
                {(["omok", "brick-breaker", "ping-pong"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setRankingGameType(type)}
                    className={`px-4 py-1.5 text-sm font-neo transition ${
                      rankingGameType === type
                        ? "bg-(--color-cyan) text-black font-bold"
                        : "bg-black/40 text-white/60 hover:bg-(--color-cyan)/20 hover:text-white"
                    }`}
                  >
                    {type === "omok" ? "오목" : type === "brick-breaker" ? "블록깨기" : "핑퐁"}
                  </button>
                ))}
              </div>
              <RankingBoard gameType={rankingGameType} />
            </Window>
          </div>
        </div>
      )}
    </div>
  );
}
