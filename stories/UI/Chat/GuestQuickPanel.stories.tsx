import type { Meta, StoryObj } from "@storybook/nextjs";
import { GuestQuickPanel } from "@/components/chat/GuestQuickPanel";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Chat/GuestQuickPanel",
  component: GuestQuickPanel,
  tags: ["autodocs"],
  args: {
    onQuickMessage: () => undefined,
    onRegisterClick: () => undefined,
  },
  decorators: [
    (Story) => (
      <StoryCanvas className="w-[420px]">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof GuestQuickPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
