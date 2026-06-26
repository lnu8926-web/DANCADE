import type { Meta, StoryObj } from "@storybook/nextjs";
import ProductDetailModal from "@/components/shop/ProductDetailModal";
import { mockProducts } from "../../mocks/products";

const meta = {
  title: "UI/Shop/ProductDetailModal",
  component: ProductDetailModal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    product: mockProducts[0],
    onClose: () => undefined,
    onPurchase: () => undefined,
    isPurchasing: false,
  },
} satisfies Meta<typeof ProductDetailModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isPurchasing: true,
  },
};

export const Disabled: Story = {
  args: {
    product: { ...mockProducts[3], isOwned: true },
  },
};
