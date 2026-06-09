import Image from "next/image";
import windowClose from "@/public/assets/icons/window-close.svg";
import windowMaximize from "@/public/assets/icons/window-maximize.svg";
import back from "@/public/assets/icons/back.svg";
import { useRouter } from "next/navigation";

interface WindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  showMaximize?: boolean;
  variant?: "page" | "modal" | "overlay";
  onClose?: () => void;
  headerRight?: React.ReactNode;
}

export default function Window({
  title,
  children,
  className = "",
  showMaximize = true,
  variant = "page",
  onClose,
  headerRight,
}: WindowProps) {
  const router = useRouter();
  const isModal = variant === "modal";
  const isOverlay = variant === "overlay";
  const isPage = variant === "page";

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (isPage) {
      router.back();
    }
  };

  return (
    <section
      className={`
        relative font-neo
        ${isPage ? "min-h-screen py-12 px-5 drop-shadow-[0_0_14px_rgba(108,173,247,0.55)]" : ""}
        ${isModal ? "h-auto" : ""}
      `}
    >
      {isPage && (
        <div className="absolute inset-0 bg-[url('/assets/background/common.png')] bg-cover bg-center bg-no-repeat opacity-15 -z-10" />
      )}

      <div
        className={`
          ${isPage ? "max-w-[1400px] w-full" : "w-full"}
          m-auto
          border border-(--color-navy)
          ${className}
        `}
      >
        {/* 핑크색 타이틀바 */}
        <div className="window-header bg-(--color-pink) flex items-center justify-between px-4 py-3">
          <button className="window-icon" onClick={handleClose}>
            <Image src={windowClose} alt="" />
          </button>

          <h2 className="text-black font-neo text-xl">{title}</h2>

          <div className="flex items-center gap-2">
            {headerRight}
            {showMaximize && isPage && (
              <button className="window-btn">
                <Image src={windowMaximize} alt="" />
              </button>
            )}
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div
          className={`
            window-content relative
            bg-(--color-dark-blue)
            flex flex-col items-center justify-center
            ${isModal ? "p-6" : ""}
            ${isPage ? "py-15 px-8 min-h-[800px] lg:max-h-[800px] gap-8" : ""}
            ${isOverlay ? "py-10 px-8 max-h-[80vh] overflow-y-auto gap-8" : ""}
          `}
        >
          {isPage && (
            <Image
              src={back}
              alt="뒤로가기"
              className="absolute left-5 top-5 cursor-pointer"
              onClick={() => router.back()}
            />
          )}

          {children}
        </div>
      </div>
    </section>
  );
}
