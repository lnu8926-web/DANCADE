import type { Meta, StoryObj } from "@storybook/nextjs";
import Window from "@/components/common/Window";
import CategoryTabs from "@/components/shop/CategoryTabs";
import ProductList from "@/components/shop/ProductList";
import ProductDetailModal from "@/components/shop/ProductDetailModal";
import { mockProducts } from "../mocks/products";

const meta = {
  title: "Showcase/Shop",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {
  render: () => (
    <div className="min-h-screen bg-[#050509] p-8 font-neo">
      <Window title="SHOP" variant="overlay" showMaximize={false}>
        <div className="flex w-full max-w-[960px] gap-6">
          <aside className="w-40 flex">
            <CategoryTabs activeCategory="all" onChange={() => undefined} />
          </aside>
          <section className="flex-1">
            <ProductList
              products={mockProducts}
              onSelect={() => undefined}
              onBuy={() => undefined}
            />
          </section>
        </div>
      </Window>
    </div>
  ),
};

export const Payment: Story = {
  render: () => (
    <ProductDetailModal
      product={mockProducts[0]}
      onClose={() => undefined}
      onPurchase={() => undefined}
      isPurchasing={false}
    />
  ),
};

export const EmptyData: Story = {
  render: () => (
    <div className="min-h-screen bg-[#050509] p-8 font-neo">
      <Window title="SHOP" variant="overlay" showMaximize={false}>
        <div className="h-[360px] w-[720px]">
          <ProductList
            products={[]}
            onSelect={() => undefined}
            onBuy={() => undefined}
          />
        </div>
      </Window>
    </div>
  ),
};
