import type { Meta, StoryObj } from "@storybook/nextjs";
import { PixelButton } from "@/components/common/LoginButton";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Common/PixelButton",
  component: PixelButton,
  tags: ["autodocs"],
  args: {
    label: "로그인",
    styleClass: "pixelBtn pixelBtn--cyan",
    textColor: "text-black font-bold",
    isLoading: false,
    loadingLabel: "로그인 중...",
    fullWidth: true,
    disabled: false,
  },
  decorators: [
    (Story) => (
      <StoryCanvas className="w-[380px]">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof PixelButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variant: Story = {
  args: {
    label: "게스트로 시작",
    styleClass: "pixelBtn pixelBtn--pink",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
