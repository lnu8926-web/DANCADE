import type { Meta, StoryObj } from "@storybook/nextjs";
import Window from "@/components/common/Window";

const meta = {
  title: "UI/Common/Window",
  component: Window,
  tags: ["autodocs"],
  args: {
    title: "DANCADE",
    children: (
      <div className="w-[420px] text-center text-white">
        <p className="text-(--color-cyan)">픽셀 윈도우 컨테이너</p>
        <p className="mt-3 text-sm text-white/70">프로젝트 전역에서 사용하는 창 UI입니다.</p>
      </div>
    ),
  },
} satisfies Meta<typeof Window>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { layout: "fullscreen" },
  args: {
    title: "LOGIN",
    variant: "page",
    showMaximize: true,
    children: <div className="text-(--color-cyan)">기본 페이지형 윈도우</div>,
  },
};

export const Overlay: Story = {
  args: {
    title: "DANCADE",
    variant: "overlay",
    showMaximize: false,
  },
};

export const Modal: Story = {
  args: {
    title: "아이템 정보",
    variant: "modal",
    children: <div className="w-[320px] text-white">모달 콘텐츠 영역</div>,
  },
};

export const Page: Story = {
  parameters: { layout: "fullscreen" },
  args: {
    title: "SHOP",
    variant: "page",
    showMaximize: true,
    children: <div className="text-(--color-cyan)">페이지형 윈도우</div>,
  },
};
