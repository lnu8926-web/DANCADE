import type { Meta, StoryObj } from "@storybook/nextjs";
import RankingBoard from "@/components/ranking/RankingBoard";
import { mockRankings } from "../mocks/rankings";
import { StoryCanvas } from "../helpers/StoryCanvas";

const meta = {
  title: "Showcase/Statistics",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Report: Story = {
  render: () => (
    <StoryCanvas className="w-[460px]">
      <RankingBoard
        gameType="pingpong"
        initialRankings={mockRankings}
        autoRotate={false}
      />
    </StoryCanvas>
  ),
};
