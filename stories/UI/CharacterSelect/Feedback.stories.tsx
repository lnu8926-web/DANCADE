import type { Meta, StoryObj } from "@storybook/nextjs";
import { ErrorScreen } from "@/components/character-select/Error";
import { LoadingScreen } from "@/components/character-select/Loading";

const meta = {
  title: "UI/CharacterSelect/Feedback",
  component: LoadingScreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LoadingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {};

export const ErrorUI: Story = {
  render: () => <ErrorScreen error={new globalThis.Error("LPC 데이터를 찾을 수 없습니다.")} />,
};

export const EmptyData: Story = {
  render: () => <ErrorScreen error={null} />,
};
