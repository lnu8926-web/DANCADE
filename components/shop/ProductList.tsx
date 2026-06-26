"use client";

import ProductItem from "@/components/shop/ProductItem";
import { Product } from "@/game/types/product";

interface ProductListProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onBuy: (product: Product) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function ProductList({
  products,
  onSelect,
  onBuy,
  isLoading = false,
  emptyMessage = "등록된 아이템이 없습니다.",
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center text-(--color-cyan) text-sm tracking-widest">
        LOADING...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center text-white/40 text-sm tracking-widest">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        gap-4
        overflow-hidden
        pr-2
        pb-4   
      "
    >
      {products.map((product) => (
        <ProductItem
          key={product.id}
          product={product}
          onSelectItem={() => onSelect(product)}
          onBuyItem={() => onBuy(product)}
        />
      ))}
    </div>
  );
}
