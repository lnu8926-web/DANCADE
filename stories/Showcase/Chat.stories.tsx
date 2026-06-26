import type { Meta, StoryObj } from "@storybook/nextjs";
import { ChatInput } from "@/components/chat/ChatInput";
import { GuestQuickPanel } from "@/components/chat/GuestQuickPanel";
import { MessageList } from "@/components/chat/MessageList";
import { mockChatMessages } from "../mocks/chat";
import styles from "@/components/chat/ChatFrame.module.css";

const meta = {
  title: "Showcase/Chat",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Chat: Story = {
  render: () => (
    <div className={styles.chatFrame}>
      <MessageList
        messages={mockChatMessages}
        currentUsername="PIXEL"
        isFocused
        onWaveClick={() => undefined}
      />
      <ChatInput isAnalyzing={false} onSend={async () => true} />
    </div>
  ),
};

export const Login: Story = {
  render: () => (
    <div className={styles.chatFrame}>
      <MessageList
        messages={[]}
        currentUsername="Guest"
        isFocused
        onWaveClick={() => undefined}
      />
      <GuestQuickPanel
        onQuickMessage={() => undefined}
        onRegisterClick={() => undefined}
      />
    </div>
  ),
};
