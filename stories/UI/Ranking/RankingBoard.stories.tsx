import type { Meta, StoryObj } from "@storybook/nextjs";
import RankingBoard from "@/components/ranking/RankingBoard";
import { mockRankings } from "../../mocks/rankings";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Ranking/RankingBoard",
  component: RankingBoard,
  tags: ["autodocs"],
  args: {
    gameType: "pingpong",
    initialRankings: mockRankings,
    autoRotate: false,
    totalPages: 5,
  },
  decorators: [
    (Story) => (
      <StoryCanvas className="w-[460px]">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof RankingBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    initialLoading: true,
  },
};

export const EmptyData: Story = {
  args: {
    initialRankings: [],
  },
};
