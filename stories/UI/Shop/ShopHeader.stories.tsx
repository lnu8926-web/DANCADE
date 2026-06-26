import type { Meta, StoryObj } from "@storybook/nextjs";
import ShopHeader from "@/components/shop/ShopHeader";

const meta = {
  title: "UI/Shop/ShopHeader",
  component: ShopHeader,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    showBackToGame: true,
  },
} satisfies Meta<typeof ShopHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRightSlot: Story = {
  args: {
    rightSlot: (
      <div className="px-3 py-1.5 text-sm bg-black/60 text-white border border-(--color-cyan)/60 font-neo">
        POINT : 1200
      </div>
    ),
  },
};

export const WithoutBackButton: Story = {
  args: {
    showBackToGame: false,
  },
};
