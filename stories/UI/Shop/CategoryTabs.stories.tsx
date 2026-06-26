import type { Meta, StoryObj } from "@storybook/nextjs";
import CategoryTabs from "@/components/shop/CategoryTabs";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Shop/CategoryTabs",
  component: CategoryTabs,
  tags: ["autodocs"],
  args: {
    activeCategory: "all",
    onChange: () => undefined,
  },
  decorators: [
    (Story) => (
      <StoryCanvas className="h-[460px] w-[220px]">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof CategoryTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variant: Story = {
  args: {
    activeCategory: "hair",
  },
};
