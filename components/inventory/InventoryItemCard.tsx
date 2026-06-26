"use client";

type InventoryProps = {
  name: string;
  imageUrl?: string;
  isEquipped: boolean;
  onClick?: () => void;
};

export default function InventoryItemCard({
  name,
  isEquipped,
  onClick,
}: InventoryProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      title="클릭하여 장착"
      className={`
        h-[72px]
        flex
        items-center
        justify-center
        cursor-pointer
        transition
        select-none
        border
        ${
          isEquipped
            ? "border-(--color-cyan) bg-(--color-cyan)/20"
            : "border-white/20 bg-white/10 hover:bg-white/20"
        }
      `}
    >
      <p className="w-full text-center text-sm leading-none">{name}</p>
    </div>
  );
}
