import type { Meta, StoryObj } from "@storybook/nextjs";
import Image from "next/image";
import { PixelButton } from "@/components/common/LoginButton";
import Window from "@/components/common/Window";
import { FormField, PasswordConfirmField } from "@/components/auth/FormField";
import { GuestDataSection } from "@/components/auth/GuestDataSection";
import logo from "@/public/assets/logos/logo.svg";

const meta = {
  title: "Showcase/Auth",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  render: () => (
    <div className="w-[900px] bg-[#050509] p-8 font-neo">
      <Window title="LOGIN" variant="overlay" showMaximize={false}>
        <section className="flex flex-wrap lg:flex-row justify-center items-center gap-7 w-full px-4 lg:px-0">
          <header>
            <Image
              src={logo}
              alt="DAN-CADE 로고"
              className="w-[220px] h-auto"
            />
          </header>

          <form className="w-full max-w-[550px] px-5 py-6 bg-white">
            <div>
              <FormField
                id="login-userid"
                label="아이디"
                value="dancade"
                placeholder="아이디를 입력하세요."
                requiredIndicator={false}
              />
              <div className="mt-6">
                <FormField
                  id="login-password"
                  type="password"
                  label="비밀번호"
                  value="password"
                  placeholder="비밀번호를 입력하세요."
                  requiredIndicator={false}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <PixelButton
                label="게스트 로그인"
                styleClass="pixelBtn pixelBtn--pink"
                textColor="text-black font-bold"
                fullWidth={false}
                className="px-6 py-3"
              />

              <div className="flex gap-3">
                <PixelButton
                  label="로그인"
                  styleClass="pixelBtn pixelBtn--cyan"
                  textColor="text-black font-bold"
                  fullWidth={false}
                  className="px-6 py-3"
                />
                <PixelButton
                  label="회원 가입"
                  styleClass="pixelBtn pixelBtn--cyan"
                  textColor="text-black font-bold"
                  fullWidth={false}
                  className="px-6 py-3"
                />
              </div>
            </div>
          </form>
        </section>
      </Window>
    </div>
  ),
};

export const Register: Story = {
  render: () => (
    <form className="w-[560px] bg-white p-6 font-neo space-y-6">
      <GuestDataSection
        hasGuestData
        guestDataSelected={false}
        shouldLoadGuestData
        guestNickname="Guest_2048"
        guestPoints={450}
        onSelectLoadData={() => undefined}
        onReselect={() => undefined}
      />
      <FormField
        id="auth-userid"
        label="아이디"
        value="dancade"
        checkStatus="available"
        placeholder="아이디를 입력하세요."
      />
      <FormField
        id="auth-nickname"
        label="닉네임"
        value="DANA"
        checkStatus="checking"
        placeholder="닉네임을 입력하세요."
      />
      <PasswordConfirmField
        id="auth-password"
        type="password"
        labelLines={["비밀번호", "확인"]}
        value="password"
      />
      <div className="flex justify-end gap-3">
        <PixelButton
          label="취소"
          styleClass="pixelBtn pixelBtn--gray"
          textColor="text-black font-bold"
          fullWidth={false}
          className="px-6 py-3"
        />
        <PixelButton
          label="회원가입"
          styleClass="pixelBtn pixelBtn--pink"
          textColor="text-black font-bold"
          fullWidth={false}
          className="px-6 py-3"
        />
      </div>
    </form>
  ),
};
