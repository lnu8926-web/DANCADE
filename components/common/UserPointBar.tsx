"use client";

import { useEffect, useRef, useState } from "react";
import { useUserPoints } from "@/hooks/user/useUserPoints";

const ITEM_HEIGHT = 24;
const STEP = 50;

export function UserPointBar() {
  const { points } = useUserPoints();

  const prevPointsRef = useRef<number>(points);
  const [numbers, setNumbers] = useState<number[]>([points]);
  const [offsetY, setOffsetY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const prev = prevPointsRef.current;
    const next = points;

    if (prev === next) return;

    const direction = prev > next ? -1 : 1;
    const step = STEP * direction;

    const list: number[] = [];
    let current = prev;

    while (
      (direction === -1 && current > next) ||
      (direction === 1 && current < next)
    ) {
      list.push(current);
      current += step;
    }

    list.push(next);

    setNumbers(list);
    setOffsetY(0);
    setIsAnimating(true);

    requestAnimationFrame(() => {
      setOffsetY(-(list.length - 1) * ITEM_HEIGHT);
    });

    const timer = setTimeout(() => {
      setNumbers([next]);
      setOffsetY(0);
      setIsAnimating(false);
      prevPointsRef.current = next;
    }, 700);

    return () => clearTimeout(timer);
  }, [points]);

  return (
<div className="flex items-center gap-3 px-4 py-2 rounded-md bg-black/50 text-white text-base scale-[1.1] origin-top-right">
  <span className="opacity-70">POINT : </span>

  <div
    className="relative overflow-hidden w-[60px]"
    style={{ height: ITEM_HEIGHT }}
  >
    <div
      style={{
        transform: `translateY(${offsetY}px)`,
        transition: isAnimating
          ? "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)"
          : "none",
      }}
    >
      {numbers.map((num, idx) => (
        <div
          key={`${num}-${idx}`}
          className="flex items-center justify-center font-bold"
          style={{ height: ITEM_HEIGHT }}
        >
          {num}
        </div>
      ))}
    </div>
  </div>
</div>

  );
}
