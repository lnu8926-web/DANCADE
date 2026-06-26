import type { Meta, StoryObj } from "@storybook/nextjs";
import { ChatInput } from "@/components/chat/ChatInput";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Chat/ChatInput",
  component: ChatInput,
  tags: ["autodocs"],
  args: {
    isAnalyzing: false,
    muteRemaining: 0,
    onSend: async () => true,
  },
  decorators: [
    (Story) => (
      <StoryCanvas className="w-[420px]">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isAnalyzing: true,
  },
};

export const Disabled: Story = {
  args: {
    muteRemaining: 125,
  },
};
