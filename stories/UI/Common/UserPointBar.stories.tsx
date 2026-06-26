import type { Meta, StoryObj } from "@storybook/nextjs";
import { UserPointBar } from "@/components/common/UserPointBar";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Common/UserPointBar",
  component: UserPointBar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <StoryCanvas className="w-[300px] flex justify-end">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof UserPointBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
