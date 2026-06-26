import type { Meta, StoryObj } from "@storybook/nextjs";
import RegisterForm from "@/components/auth/RegisterForm";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Auth/RegisterForm",
  component: RegisterForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <StoryCanvas tone="light" className="w-[540px]">
        <Story />
      </StoryCanvas>
    ),
  ],
  args: {
    isModal: false,
  },
} satisfies Meta<typeof RegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Modal: Story = {
  args: {
    isModal: true,
  },
};
