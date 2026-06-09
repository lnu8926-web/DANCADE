"use client";
import { Product } from "@/game/types/product";

interface ProductItemProps {
  product: Product;
  onSelectItem: () => void;
  onBuyItem: () => void;
}

export default function ProductItem({ product, onSelectItem, onBuyItem }: ProductItemProps) {
  return (
    <div
      onClick={onSelectItem}
      className="relative cursor-pointer group"
    >
      <div
        className="
          absolute inset-0
          translate-x-1.5 translate-y-1.5
          border-2 border-(--color-cyan)
          pointer-events-none
        "
      />

      <div
        className={`
          relative z-10
          h-[200px] w-full
          bg-(--color-dark-blue)
          flex flex-col justify-between
          px-4 py-6
          transition-all
          ${
            product.isOwned
              ? ""
              : "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
          }
        `}
      >
        <div className="text-white text-center text-sm tracking-wide pt-8">
          {product.name}
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            if (product.isOwned) return;
            onBuyItem();
          }}
          className={`
            border-t border-(--color-cyan)/30
            flex items-center justify-center gap-2 py-1
            text-sm
            ${
              product.isOwned
                ? "text-white/30 cursor-default"
                : "text-(--color-cyan) hover:bg-(--color-cyan)/10 cursor-pointer"
            }
          `}
        >
          {product.isOwned ? (
            <span className="text-xs font-bold">보유중</span>
          ) : (
            <>
              <span className="text-xs">⭐</span>
              <span className="text-xs font-bold">{product.price}</span>
              <span className="text-xs">P</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
