"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/assets/logos/logo.svg";
import brickBreaker from "@/public/assets/screenshots/brick-breaker.png";
import pingPong from "@/public/assets/screenshots/ping-pong.png";
import Window from "@/components/common/Window";
import { PixelButton } from "@/components/common/LoginButton";
import { FormField } from "@/components/auth/FormField";
import { useAuth } from "@/hooks/auth/useAuth";
import { useGuestAuth } from "@/hooks/useGuestAuth";
import { useLogin } from "@/hooks/auth/useLogin";
import { useCharacterStorage } from "@/hooks/useCharacterStorage";
import { getCurrentUser } from "@/lib/utils/auth";

const gameList = [
  { src: brickBreaker, alt: "벽돌깨기 게임" },
  { src: pingPong, alt: "핑퐁 게임" },
  { src: brickBreaker, alt: "벽돌깨기 게임" },
  { src: pingPong, alt: "핑퐁 게임" },
];

export default function LoginIdPage() {
  const router = useRouter();
  const { login, isLoading: isAuthLoading } = useAuth();
  const { getOrCreateGuestUser } = useGuestAuth();
  const { readCharacter } = useLogin();
  const { saveCharacterLocal } = useCharacterStorage();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setErrorMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      await login({
        userid: formData.username,
        password: formData.password,
      });

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error("로그인 후 유저 정보를 불러올 수 없습니다.");
      }

      const result = await readCharacter(currentUser.uuid!);
      const characterSkin = result?.characterSkin;

      if (characterSkin) {
        saveCharacterLocal(characterSkin);
        router.push("/game");
      } else {
        router.push("/character-select");
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "아이디 또는 비밀번호가 일치하지 않습니다.";
      setErrorMessage(errorMsg);
    }
  };

  return (
    <main className="login-id-page font-neo">
      <Window title="LOGIN">
        <section className="login-form-section flex flex-wrap lg:flex-row justify-center items-center gap-7 w-full mb-9 px-4 lg:px-0">
          <header className="login-header mb-6 lg:mb-0">
            <Image
              src={logo}
              alt="DAN-CADE 로고"
              className="w-[320px] lg:w-[220px] h-auto"
            />
          </header>

          <form
            className="login-form w-full max-w-[550px] px-5 py-6 bg-white border-box"
            onSubmit={handleSubmit}
          >
            <div className="space-y-6">
              <FormField
                id="username"
                label="아이디"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="아이디를 입력하세요."
                autoComplete="username"
                disabled={isAuthLoading}
                requiredIndicator={false}
              />

              <FormField
                id="password"
                label="비밀번호"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요."
                autoComplete="current-password"
                disabled={isAuthLoading}
                requiredIndicator={false}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isAuthLoading}
                    className="px-3 border border-(--color-navy) border-l-0 text-gray-600 hover:text-gray-800 transition-colors disabled:cursor-not-allowed"
                    title={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                }
              />

              {errorMessage && (
                <p className="text-left text-(--color-pink)">
                  {errorMessage}
                </p>
              )}
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-between items-center mt-6">
              {/* 왼쪽: 게스트 로그인 */}
              <PixelButton
                type="button"
                label="게스트 로그인"
                styleClass="pixelBtn pixelBtn--pink"
                textColor="text-black font-bold"
                fullWidth={false}
                className="login-button px-6 py-3"
                onClick={() => {
                  getOrCreateGuestUser();
                  router.push("/character-select");
                }}
                disabled={isAuthLoading}
              />

              {/* 오른쪽: 아이디 로그인, 회원가입 */}
              <div className="flex gap-3">
                <PixelButton
                  type="submit"
                  label="로그인"
                  styleClass="pixelBtn pixelBtn--cyan"
                  textColor="text-black font-bold"
                  isLoading={isAuthLoading}
                  loadingLabel="로그인 중..."
                  fullWidth={false}
                  className="login-button px-6 py-3"
                  disabled={isAuthLoading}
                />
                <PixelButton
                  type="button"
                  label="회원 가입"
                  styleClass="pixelBtn pixelBtn--cyan"
                  textColor="text-black font-bold"
                  fullWidth={false}
                  className="login-button px-6 py-3"
                  onClick={() => router.push("/auth/register")}
                  disabled={isAuthLoading}
                />
              </div>
            </div>
          </form>
        </section>

        {/* 게임 프리뷰 */}
        <section
          className="game-gallery px-4 lg:px-0"
          aria-label="게임 미리보기"
        >
          <ul className="game-list relative grid grid-cols-2 gap-10 justify-items-center lg:flex lg:gap-7 lg:justify-center">
            {gameList.map((game, idx) => (
              <li
                key={idx}
                className="game-item relative z-2 w-[42vw] sm:w-[33vw] lg:w-[30vw] max-w-[220px] aspect-220/300 border border-(--color-cyan) shadow-[0px_4px_40px_rgba(0,255,255,0.25)]"
              >
                <Image
                  src={game.src}
                  alt={game.alt}
                  fill
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      </Window>
    </main>
  );
}
