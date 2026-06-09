"use client";

import { useEffect, useRef, useState } from "react";
import { getRankingsPage } from "@/lib/supabase/ranking";

interface RankingItem {
  id: number;
  score: number;
  users: {
    nickname: string;
  };
}

export default function RankingBoard({ gameType }: { gameType: string }) {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const totalPages = 5;
  const cacheRef = useRef<
    Map<string, Map<number, { data: RankingItem[]; fetchedAt: number }>>
  >(new Map());
  const CACHE_TTL_MS = 30000;

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const gameCache = cacheRef.current.get(gameType) ?? new Map();
    if (!cacheRef.current.has(gameType)) {
      cacheRef.current.set(gameType, gameCache);
    }

    const cached = gameCache.get(page);
    const isCacheValid =
      !!cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS;

    if (isCacheValid && cached) {
      setRankings(cached.data);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);

    getRankingsPage(gameType, page).then((data) => {
      if (isMounted) {
        setRankings(data);
        setLoading(false);
        gameCache.set(page, { data, fetchedAt: Date.now() });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [page, gameType]);

  useEffect(() => {
    if (!isPageVisible) return;

    const interval = setInterval(() => {
      setPage((prev) => (prev >= totalPages ? 1 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isPageVisible, totalPages]);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}`;
  };

  return (
    <div className="bg-(--color-dark-blue) border border-(--color-navy) p-6 w-full max-w-md font-neo">
      <h2 className="text-xl text-(--color-cyan) mb-4 text-center tracking-widest">
        🏆 랭킹 TOP 100
      </h2>

      <div className="text-center text-white/40 text-xs mb-4">
        {page} / {totalPages}
      </div>

      <div className="space-y-2 min-h-[400px]">
        {loading ? (
          <div className="text-center text-(--color-cyan)/60 py-8 text-sm">
            로딩 중...
          </div>
        ) : (
          rankings.map((rank, index) => {
            const rankNumber = (page - 1) * 20 + index + 1;
            return (
              <div
                key={rank.id}
                className={`flex justify-between items-center px-3 py-2 transition-all ${
                  rankNumber <= 3
                    ? "border border-(--color-cyan)/40 bg-(--color-cyan)/10"
                    : "border border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className="w-12 text-center font-bold text-sm">
                  {getMedalColor(rankNumber)}
                </span>
                <span className="flex-1 text-white text-sm">
                  {rank.users.nickname}
                </span>
                <span className="text-(--color-cyan) font-bold text-sm">
                  {rank.score.toLocaleString()}점
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* 진행 바 */}
      <div className="mt-6 flex gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            className={`h-1.5 flex-1 transition-all cursor-pointer ${
              page === num
                ? "bg-(--color-cyan) scale-110"
                : "bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* 이전/다음 버튼 */}
      <div className="mt-4 flex justify-between gap-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="flex-1 py-2 border border-(--color-navy) text-white text-sm hover:border-(--color-cyan) hover:text-(--color-cyan) transition"
        >
          ◀ 이전
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="flex-1 py-2 border border-(--color-navy) text-white text-sm hover:border-(--color-cyan) hover:text-(--color-cyan) transition"
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
}
