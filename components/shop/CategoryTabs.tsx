"use client";
export const SHOP_CATEGORIES = [
  { key: "all", label: "전체"  },
  { key: "hair", label: "헤어" },
  { key: "top", label: "상의" },
  { key: "bottom", label: "하의" },
  { key: "feet", label: "신발" },
] as const;

export type ShopCategory = typeof SHOP_CATEGORIES[number]["key"];

interface CategoryTabsProps {
  activeCategory: ShopCategory;
  onChange: (category: ShopCategory) => void;
}

export default function CategoryTabs({
  activeCategory,
  onChange,
}: CategoryTabsProps) {
  return (
    <nav className="relative h-full">
      <div className="absolute left-0 top-0 h-full w-0.5 bg-white/80 rounded-sm" />

      <div className="h-full flex items-start pt-4">
        <ul className="flex flex-col gap-8 py-2">
          {SHOP_CATEGORIES.map((cat) => {
            const isActive = cat.key === activeCategory;

            return (
              <li
                key={cat.key}
                onClick={() => onChange(cat.key)}
                className={`
                  cursor-pointer select-none
                  h-14 flex items-center gap-3
                  px-4
                  text-xl
                  transition-all
                  ${
                    isActive
                    ? "bg-(--color-cyan) text-black font-semibold pr-20"
                    : "text-white/70 hover:text-white"
                  }
                `}
              >
                {cat.label}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
