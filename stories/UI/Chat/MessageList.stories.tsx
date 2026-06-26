import type { Meta, StoryObj } from "@storybook/nextjs";
import { MessageList } from "@/components/chat/MessageList";
import { mockChatMessages } from "../../mocks/chat";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Chat/MessageList",
  component: MessageList,
  tags: ["autodocs"],
  args: {
    messages: mockChatMessages,
    currentUsername: "PIXEL",
    isFocused: true,
    onWaveClick: () => undefined,
  },
  decorators: [
    (Story) => (
      <StoryCanvas className="w-[420px]">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof MessageList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variant: Story = {
  args: {
    isFocused: false,
  },
};

export const EmptyData: Story = {
  args: {
    messages: [],
  },
};
