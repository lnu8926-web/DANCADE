import type { Meta, StoryObj } from "@storybook/nextjs";
import ToastContainer from "@/components/common/ToastContainer";
import { mockToasts } from "../../mocks/toasts";

const meta = {
  title: "UI/Common/ToastContainer",
  component: ToastContainer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    toasts: mockToasts,
  },
} satisfies Meta<typeof ToastContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyData: Story = {
  args: {
    toasts: [],
  },
};
