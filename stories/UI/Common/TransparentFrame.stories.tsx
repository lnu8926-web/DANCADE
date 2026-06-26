import type { Meta, StoryObj } from "@storybook/nextjs";
import TransparentFrame from "@/components/common/TransparentFrame";

const meta = {
  title: "UI/Common/TransparentFrame",
  component: TransparentFrame,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    children: (
      <div className="text-white text-center pt-20 font-neo">
        <p className="text-(--color-cyan) text-xl">TransparentFrame</p>
        <p className="mt-2 text-sm text-white/60">배경 이미지가 있는 전체 화면 레이아웃</p>
      </div>
    ),
  },
} satisfies Meta<typeof TransparentFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithContent: Story = {
  args: {
    className: "flex-col items-center justify-center gap-6",
    children: (
      <div className="text-white font-neo text-center">
        <h1 className="text-3xl text-(--color-cyan) mb-4">DANCADE</h1>
        <p className="text-white/70">컨텐츠 영역</p>
      </div>
    ),
  },
};
