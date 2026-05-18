"use client";

import { useState, useEffect } from "react";
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
  const totalPages = 5; // TOP 100 = 5페이지

  // 페이지 로드
  useEffect(() => {
    let isMounted = true;

    getRankingsPage(gameType, page).then((data) => {
      if (isMounted) {
        setRankings(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [page, gameType]);

  // 자동 넘김 (5초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setPage((prev) => {
        setLoading(true);
        if (prev >= totalPages) return 1;
        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [totalPages]);
  const getMedalColor = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        🏆 랭킹 TOP 100
      </h2>

      {/* 현재 페이지 표시 */}
      <div className="text-center text-gray-400 mb-4">
        페이지 {page} / {totalPages}
      </div>

      {/* 랭킹 리스트 */}
      <div className="space-y-2 min-h-[400px]">
        {loading ? (
          <div className="text-center text-gray-400 py-8">로딩 중...</div>
        ) : (
          rankings.map((rank, index) => {
            const rankNumber = (page - 1) * 20 + index + 1;
            return (
              <div
                key={rank.id}
                className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                  rankNumber <= 3
                    ? "bg-linear-to-r from-yellow-600/30 to-yellow-500/10 border border-yellow-500/30"
                    : "bg-gray-700/50 hover:bg-gray-700"
                }`}
              >
                <span className="w-12 text-center font-bold text-lg">
                  {getMedalColor(rankNumber)}
                </span>
                <span className="flex-1 text-white font-medium">
                  {rank.users.nickname}
                </span>
                <span className="text-yellow-400 font-bold">
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
            onClick={() => {
              setLoading(true);
              setPage(num);
            }}
            className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
              page === num
                ? "bg-blue-500 scale-110"
                : "bg-gray-600 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>

      {/* 이전/다음 버튼 */}
      <div className="mt-4 flex justify-between gap-4">
        <button
          onClick={() => {
            setLoading(true);
            setPage((p) => Math.max(1, p - 1));
          }}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
        >
          ◀ 이전
        </button>
        <button
          onClick={() => {
            setLoading(true);
            setPage((p) => Math.min(totalPages, p + 1));
          }}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
}
