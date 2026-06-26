import type { Meta, StoryObj } from "@storybook/nextjs";
import ProductItem from "@/components/shop/ProductItem";
import { mockProducts } from "../../mocks/products";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Shop/ProductItem",
  component: ProductItem,
  tags: ["autodocs"],
  args: {
    product: mockProducts[0],
    onSelectItem: () => undefined,
    onBuyItem: () => undefined,
  },
  decorators: [
    (Story) => (
      <StoryCanvas className="w-[260px]">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof ProductItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variant: Story = {
  args: {
    product: mockProducts[2],
  },
};

export const Disabled: Story = {
  args: {
    product: { ...mockProducts[3], isOwned: true },
  },
};

export const Loading: Story = {
  args: {
    product: { ...mockProducts[0], style_key: undefined },
  },
};
