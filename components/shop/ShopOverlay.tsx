"use client";

import { useEffect, useState } from "react";

import type { CharacterState } from "@/components/avatar/utils/LpcTypes";
import { ITEMS_PER_PAGE } from "@/constants/shopPageNation";
import { Product } from "@/game/types/product";

import { useAuth } from "@/hooks/auth/useAuth";
import { useCharacterStorage } from "@/hooks/useCharacterStorage";
import { useProducts } from "@/hooks/shop/useProducts";
import { useShopOwnedItems } from "@/hooks/shop/useShopOwnedItems";
import { usePurchase } from "@/hooks/shop/usePurchase";

import Window from "@/components/common/Window";
import { UserPointBar } from "@/components/common/UserPointBar";
import { useToast } from "@/components/common/ToastProvider";
import CategoryTabs, { ShopCategory } from "@/components/shop/CategoryTabs";
import ProductDetailModal from "@/components/shop/ProductDetailModal";
import ProductList from "@/components/shop/ProductList";
import ShopCharacterPreview from "@/components/shop/ShopCharacterPreview";

const SHOP_CATEGORY_TO_LPC_PART: Record<
  ShopCategory,
  keyof CharacterState["parts"] | null
> = {
  all: null,
  hair: "hair",
  top: "torso",
  bottom: "legs",
  feet: "feet",
};

interface ShopOverlayProps {
  onClose: () => void;
}

export default function ShopOverlay({ onClose }: ShopOverlayProps) {
  const [previewCharacter, setPreviewCharacter] =
    useState<CharacterState | null>(null);
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { showToast } = useToast();
  const { getCurrentUser } = useAuth();
  const { loadCharacterLocal } = useCharacterStorage();
  const gender = previewCharacter?.gender as "male" | "female" | undefined;
  const { products, isLoading } = useProducts(gender);
  const { ownedItemIds, isLoading: ownedLoading, refetch } = useShopOwnedItems();
  const { purchase, isLoading: isPurchasing } = usePurchase();

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  useEffect(() => {
    const stored = loadCharacterLocal();
    if (!stored) return;
    setPreviewCharacter(stored);
  }, [loadCharacterLocal]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const productsWithOwnership = products.map((product) => ({
    ...product,
    isOwned: ownedItemIds.includes(product.id),
  }));
  const filteredProducts =
    activeCategory === "all"
      ? productsWithOwnership
      : productsWithOwnership.filter((p) => p.category === activeCategory);
  const pagedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const requireUser = () => {
    const user = getCurrentUser();
    if (!user) {
      showToast({ type: "info", message: "회원 가입 후 진행해주세요." });
      return null;
    }
    return user;
  };

  const handleBuyProduct = (product: Product) => {
    if (!requireUser()) return;
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handlePurchase = async (product: Product) => {
    if (isPurchasing) return;
    if (!requireUser()) return;

    const user = getCurrentUser()!;
    const result = await purchase(user.id, product.id);

    if (!result) {
      showToast({ type: "error", message: "포인트가 부족합니다." });
    } else {
      showToast({ type: "success", message: "구매가 완료되었습니다!" });
      await refetch();
    }

    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handlePreviewItem = (product: Product) => {
    if (!product.style_key || !previewCharacter) return;
    const partKey = SHOP_CATEGORY_TO_LPC_PART[product.category as ShopCategory];
    if (!partKey) return;

    setPreviewCharacter((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        parts: {
          ...prev.parts,
          [partKey]: { ...prev.parts[partKey], styleId: product.style_key },
        },
      };
    });
  };

  return (
    <Window title="SHOP" variant="overlay" headerRight={<UserPointBar />} onClose={onClose}>
      <div className="flex w-full gap-6">
        <div className="flex gap-6 pr-6">
          <aside className="w-40 flex items-start justify-center pt-4">
            {previewCharacter && (
              <ShopCharacterPreview character={previewCharacter} />
            )}
          </aside>

          <aside className="w-40 flex">
            <CategoryTabs
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />
          </aside>
        </div>

        <section className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="h-[512px]">
            <ProductList
              products={pagedProducts}
              onSelect={handlePreviewItem}
              onBuy={handleBuyProduct}
              isLoading={isLoading || ownedLoading}
            />
          </div>

          <div className="flex justify-center gap-4 py-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm transition ${
                    isActive
                      ? "bg-(--color-cyan) text-black font-bold"
                      : "bg-black/40 text-white/50 hover:bg-(--color-cyan)/20 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {isModalOpen && selectedProduct && (
            <ProductDetailModal
              product={selectedProduct}
              onClose={handleModal}
              onPurchase={handlePurchase}
              isPurchasing={isPurchasing}
            />
          )}
        </section>
      </div>
    </Window>
  );
}
