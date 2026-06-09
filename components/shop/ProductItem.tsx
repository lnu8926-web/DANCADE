"use client";
import { Product } from "@/game/types/product";
import { useProductThumbnail } from "@/hooks/shop/useProductThumbnail";

interface ProductItemProps {
  product: Product;
  onSelectItem: () => void;
  onBuyItem: () => void;
}

export default function ProductItem({ product, onSelectItem, onBuyItem }: ProductItemProps) {
  const thumbnail = useProductThumbnail(product.category, product.style_key);

  return (
    <div onClick={onSelectItem} className="relative cursor-pointer group">
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 border-2 border-(--color-cyan) pointer-events-none" />

      <div
        className={`
          relative z-10 h-40 w-full
          bg-(--color-dark-blue)
          flex flex-col
          transition-all
          ${product.isOwned ? "" : "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"}
        `}
      >
        {/* 썸네일 */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={product.name}
              style={{ imageRendering: "pixelated", width: 128, height: 128 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
              ...
            </div>
          )}
        </div>

        {/* 이름 */}
        <div className="text-white text-center text-xs tracking-wide px-2 pb-1 truncate">
          {product.name}
        </div>

        {/* 가격 */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (product.isOwned) return;
            onBuyItem();
          }}
          className={`
            border-t border-(--color-cyan)/30
            flex items-center justify-center gap-2 py-1.5
            ${product.isOwned
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
