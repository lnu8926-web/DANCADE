import type { Meta, StoryObj } from "@storybook/nextjs";
import RegisterModal from "@/components/auth/RegisterModal";

const meta = {
  title: "UI/Auth/RegisterModal",
  component: RegisterModal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    onClose: () => {},
    onSuccess: () => {},
  },
} satisfies Meta<typeof RegisterModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};
