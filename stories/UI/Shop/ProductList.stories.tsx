import type { Meta, StoryObj } from "@storybook/nextjs";
import ProductList from "@/components/shop/ProductList";
import { mockProducts, emptyProducts } from "../../mocks/products";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Shop/ProductList",
  component: ProductList,
  tags: ["autodocs"],
  args: {
    products: mockProducts,
    onSelect: () => undefined,
    onBuy: () => undefined,
  },
  decorators: [
    (Story) => (
      <StoryCanvas className="w-[760px]">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof ProductList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    products: emptyProducts,
    isLoading: true,
  },
};

export const EmptyData: Story = {
  args: {
    products: emptyProducts,
  },
};
