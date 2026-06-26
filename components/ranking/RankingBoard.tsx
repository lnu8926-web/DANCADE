"use client";

import { useEffect, useRef, useState } from "react";
import { getRankingsPage, getRankingsCount } from "@/lib/supabase/ranking";

export interface RankingItem {
  id: number;
  score: number;
  users: {
    nickname: string;
  };
}

const PAGE_SIZE = 20;

interface RankingBoardProps {
  gameType: string;
  initialRankings?: RankingItem[];
  initialLoading?: boolean;
  autoRotate?: boolean;
  totalPages?: number;
  fetchPage?: (gameType: string, page: number) => Promise<RankingItem[]>;
  fetchTotalCount?: (gameType: string) => Promise<number>;
}

export default function RankingBoard({
  gameType,
  initialRankings,
  initialLoading = false,
  autoRotate = true,
  totalPages: totalPagesProp,
  fetchPage = getRankingsPage,
  fetchTotalCount = getRankingsCount,
}: RankingBoardProps) {
  const [rankings, setRankings] = useState<RankingItem[]>(
    initialRankings ?? []
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(initialLoading);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [resolvedTotalPages, setResolvedTotalPages] = useState(
    totalPagesProp ?? 1
  );
  const cacheRef = useRef<
    Map<string, Map<number, { data: RankingItem[]; fetchedAt: number }>>
  >(new Map());
  const CACHE_TTL_MS = 30000;
  const isStaticData = initialRankings !== undefined;

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

  // gameType이 바뀔 때마다 전체 건수를 가져와 totalPages 계산
  useEffect(() => {
    if (isStaticData || totalPagesProp !== undefined) return;

    setPage(1);

    fetchTotalCount(gameType).then((count) => {
      setResolvedTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
    });
  }, [gameType, isStaticData, totalPagesProp, fetchTotalCount]);

  useEffect(() => {
    if (totalPagesProp !== undefined) {
      setResolvedTotalPages(totalPagesProp);
    }
  }, [totalPagesProp]);

  useEffect(() => {
    if (isStaticData) {
      setRankings(initialRankings);
      setLoading(initialLoading);
      return;
    }

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

    fetchPage(gameType, page).then((data) => {
      if (isMounted) {
        setRankings(data);
        setLoading(false);
        gameCache.set(page, { data, fetchedAt: Date.now() });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fetchPage, gameType, initialLoading, initialRankings, isStaticData, page]);

  useEffect(() => {
    if (!autoRotate || !isPageVisible) return;

    const interval = setInterval(() => {
      setPage((prev) => (prev >= resolvedTotalPages ? 1 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate, isPageVisible, resolvedTotalPages]);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}`;
  };

  return (
    <div className="bg-(--color-dark-blue) border border-(--color-navy) p-6 w-full font-neo">
      <h2 className="text-xl text-(--color-cyan) mb-4 text-center tracking-widest">
        🏆 랭킹 TOP 100
      </h2>

      <div className="text-center text-white/40 text-xs mb-4">
        {page} / {resolvedTotalPages}
      </div>

      <div className="space-y-2 min-h-[400px]">
        {loading ? (
          <div className="text-center text-(--color-cyan)/60 py-8 text-sm">
            로딩 중...
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center text-white/40 py-8 text-sm">
            랭킹 데이터가 없습니다.
          </div>
        ) : (
          rankings.map((rank, index) => {
            const rankNumber = (page - 1) * PAGE_SIZE + index + 1;
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
      {resolvedTotalPages > 1 && (
      <div className="mt-6 flex gap-2">
        {Array.from({ length: resolvedTotalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setPage(num)}
            className={`h-1.5 flex-1 transition-all cursor-pointer ${
              page === num
                ? "bg-(--color-cyan) scale-110"
                : "bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
      )}

      {/* 이전/다음 버튼 */}
      {resolvedTotalPages > 1 && (
        <div className="mt-4 flex justify-between gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex-1 py-2 border border-(--color-navy) text-white text-sm hover:border-(--color-cyan) hover:text-(--color-cyan) transition"
          >
            ◀ 이전
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(resolvedTotalPages, p + 1))}
            className="flex-1 py-2 border border-(--color-navy) text-white text-sm hover:border-(--color-cyan) hover:text-(--color-cyan) transition"
          >
            다음 ▶
          </button>
        </div>
      )}
    </div>
  );
}
