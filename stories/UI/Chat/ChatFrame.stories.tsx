import type { Meta, StoryObj } from "@storybook/nextjs";
import ChatFrame from "@/components/chat/ChatFrame";

const meta = {
  title: "UI/Chat/ChatFrame",
  component: ChatFrame,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    initialHidden: false,
  },
} satisfies Meta<typeof ChatFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hidden: Story = {
  args: {
    initialHidden: true,
  },
};
