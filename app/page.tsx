"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/public/assets/logos/logo.svg";
import Window from "@/components/common/Window";
import { useGuestAuth } from "@/hooks/useGuestAuth";

const LOGIN_BUTTONS = [
  {
    id: "email",
    label: "아이디 로그인",
    style: "bg-[var(--color-cyan)]",
    type: "email" as const,
  },
  {
    id: "guest",
    label: "게스트 로그인",
    style: "border border-[var(--color-cyan)]",
    type: "guest" as const,
  },
] as const;

export default function Home() {
  const router = useRouter();
  const { getOrCreateGuestUser } = useGuestAuth();

  const handleEmailLogin = () => router.push("/auth/login/id");
  const handleGuestLogin = () => {
    getOrCreateGuestUser();
    router.push("/character-select");
  };

  return (
    <main className="login-page relative min-h-screen">
      <div className="absolute inset-0 bg-[url('/assets/background/common.png')] bg-cover bg-center bg-no-repeat opacity-15 -z-10" />
      <Window title="LOGIN">
        <Image src={logo} alt="DAN-CADE 로고" width={262} height={185} />
        <div className="text-black flex flex-col gap-4 w-full items-center">
          {LOGIN_BUTTONS.map((button) => (
            <button
              key={button.id}
              onClick={
                button.type === "email" ? handleEmailLogin : handleGuestLogin
              }
              className={`${
                button.style
              } py-5 max-w-[320px] w-full cursor-pointer ${
                button.type === "guest" ? "text-white" : ""
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </Window>
    </main>
  );
}
