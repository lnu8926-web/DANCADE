import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import {
  PART_CATEGORIES,
  COLOR_CATEGORIES,
  COLOR_PALETTES,
  COLOR_HEX,
  type PartCategory,
  type ColorCategory,
} from "@/constants/inventory";
import { mockInventoryItems } from "../mocks/inventory";

const meta = {
  title: "Showcase/Inventory",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function InventoryPanel() {
  const [activeCategory, setActiveCategory] = useState<PartCategory>("Hair");
  const [activeColorCategory, setActiveColorCategory] = useState<ColorCategory>("Skin");
  const [equippedIndex, setEquippedIndex] = useState(0);

  return (
    <div className="w-[400px] h-[520px] bg-(--color-dark-blue) border border-(--color-navy) flex flex-col font-neo">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between bg-(--color-pink) select-none">
        <span className="text-black text-sm font-bold">INVENTORY</span>
        <button className="text-black/60 text-xs hover:text-black">✕</button>
      </div>

      {/* 파츠 탭 */}
      <div className="flex gap-2 px-3 py-2 border-b border-(--color-navy)">
        {PART_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 text-xs ${
              activeCategory === cat
                ? "bg-(--color-cyan) text-black font-bold"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 아이템 그리드 */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-4 gap-3">
          {mockInventoryItems.map((item, i) => (
            <InventoryItemCard
              key={i}
              name={item.name}
              imageUrl={item.imageUrl}
              isEquipped={i === equippedIndex}
              onClick={() => setEquippedIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* 색상 탭 */}
      <div className="px-3 py-2 border-t border-(--color-navy)">
        <div className="flex gap-2 flex-wrap">
          {COLOR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveColorCategory(cat)}
              className={`px-3 py-1 text-xs ${
                activeColorCategory === cat
                  ? "bg-(--color-cyan) text-black font-bold"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 색상 Picker */}
      <div className="px-3 pb-3">
        <div className="pl-2 flex gap-2 flex-wrap">
          {COLOR_PALETTES[activeColorCategory].map((color) => (
            <button
              key={color}
              title={color}
              className="w-6 h-6 rounded-full border border-white/40 hover:scale-110 transition"
              style={{ backgroundColor: COLOR_HEX[color] }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const Panel: Story = {
  render: () => <InventoryPanel />,
};
