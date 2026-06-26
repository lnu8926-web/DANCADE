import type { ButtonHTMLAttributes } from "react";

interface SelectButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
  disabled?: boolean;
}

export function ButtonGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2.5">{children}</div>;
}

export function SelectButton({
  active,
  onClick,
  children,
  size = "md",
  disabled = false,
}: SelectButtonProps) {
  const sizeClasses =
    size === "sm" ? "px-2 py-2 text-xs" : "px-5 py-2.5 text-sm";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses}
        inline-flex justify-center
        rounded cursor-pointer transition-all border-2
        disabled:opacity-50 disabled:cursor-not-allowed
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
  className = "bg-[#ffff00] text-black hover:opacity-90",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`px-6 py-3 text-lg font-bold border-none rounded-lg cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
