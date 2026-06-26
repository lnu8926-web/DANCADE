import type { Meta, StoryObj } from "@storybook/nextjs";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Inventory/InventoryItemCard",
  component: InventoryItemCard,
  tags: ["autodocs"],
  args: {
    name: "클래식 헤어",
    isEquipped: false,
    onClick: () => undefined,
  },
  decorators: [
    (Story) => (
      <StoryCanvas className="w-[180px]">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof InventoryItemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variant: Story = {
  args: {
    name: "픽셀 슈즈",
  },
};

export const Disabled: Story = {
  args: {
    isEquipped: true,
  },
};
