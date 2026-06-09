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

export default function ShopPage() {
  // state
  const [previewCharacter, setPreviewCharacter] =
    useState<CharacterState | null>(null);
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // hooks
  const { showToast } = useToast();
  const { getCurrentUser } = useAuth();
  const { loadCharacterLocal } = useCharacterStorage();
  const gender = previewCharacter?.gender as "male" | "female" | undefined;
  const { products, isLoading } = useProducts(gender);
  const { ownedItemIds, isLoading: ownedLoading, refetch } = useShopOwnedItems();
  const { purchase, isLoading: isPurchasing } = usePurchase();

  // effects
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  useEffect(() => {
    const stored = loadCharacterLocal();
    if (!stored) return;
    setPreviewCharacter(stored);
  }, [loadCharacterLocal]);

  if (isLoading || ownedLoading)
    return (
      <div className="min-h-screen bg-(--color-dark-blue) flex items-center justify-center font-neo text-(--color-cyan) text-sm tracking-widest">
        LOADING...
      </div>
    );

  // 파생값
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const productsWithOwnership = products.map((product) => ({
    ...product,
    isOwned: ownedItemIds.includes(product.id),
  }));
  const filteredProducts =
    activeCategory === "all"
      ? productsWithOwnership
      : productsWithOwnership.filter(
          (product) => product.category === activeCategory
        );
  const pagedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // 핸들러
  const requireUser = () => {
    const user = getCurrentUser();
    if (!user) {
      showToast({ type: "info", message: "회원 가입 후 진행해주세요." });
      return null;
    }
    return user;
  };

  const handleBuyProduct = (product: Product) => {
    const user = requireUser();
    if (!user) return;

    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handlePurchase = async (product: Product) => {
    if (isPurchasing) return;

    const user = requireUser();
    if (!user) return;

    const result = await purchase(user.id, product.id);

    if (!result) {
      showToast({ type: "info", message: "구매에 실패했습니다 포인트부족" });
    } else {
      showToast({ type: "success", message: "구매가 완료되었습니다!" });
      await refetch();
    }

    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handlePreviewItem = (product: Product) => {
    if (!product.style_key) return;
    if (!previewCharacter) return;

    const partKey = SHOP_CATEGORY_TO_LPC_PART[product.category as ShopCategory];
    if (!partKey) return;

    setPreviewCharacter((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        parts: {
          ...prev.parts,
          [partKey]: {
            ...prev.parts[partKey],
            styleId: product.style_key,
          },
        },
      };
    });
  };

  return (
    <main className="shopPage relative min-h-screen">
      <Window title="SHOP" headerRight={<UserPointBar />}>
        <div className="flex w-full gap-6">
          <div className="flex gap-6 pr-20">
            <aside className="w-[280px] flex items-center justify-center">
              {previewCharacter && (
                <ShopCharacterPreview character={previewCharacter} />
              )}
            </aside>

            <aside className="side-content w-40 flex">
              <CategoryTabs
                activeCategory={activeCategory}
                onChange={setActiveCategory}
              />
            </aside>
          </div>

          {/* 카드 리스트 영역 */}
          <section className="shop-content flex-1 flex flex-col gap-4 min-h-[720px]">
            <div className="flex-1">
              <ProductList
                products={pagedProducts}
                onSelect={handlePreviewItem}
                onBuy={handleBuyProduct}
              />
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center gap-4 py-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      px-3 py-1
                      text-sm transition
                      ${
                        isActive
                          ? "bg-(--color-cyan) text-black font-bold"
                          : "bg-black/40 text-white/50 hover:bg-(--color-cyan)/20 hover:text-white"
                      }
                    `}
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
    </main>
  );
}
