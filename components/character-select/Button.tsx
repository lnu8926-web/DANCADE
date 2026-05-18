interface SelectButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
}

export function ButtonGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2.5">{children}</div>;
}

export function SelectButton({
  active,
  onClick,
  children,
  size = "md",
}: SelectButtonProps) {
  const sizeClasses =
    size === "sm" ? "px-2 py-2 text-xs" : "px-5 py-2.5 text-sm";

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses}
        inline-flex justify-center
        rounded cursor-pointer transition-all border-2
        ${
          active
            ? "font-medium bg-[#ffff00] text-black border-[#ffff00]"
            : "font-normal bg-[#444] text-white border-[#666]"
        }
      `}
    >
      {children}
    </button>
  );
}

export function ActionButton({
  onClick,
  children,
  className,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`px-6 py-3 text-lg font-bold border-none rounded-lg cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
