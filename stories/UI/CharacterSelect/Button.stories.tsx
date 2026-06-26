import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  ActionButton,
  ButtonGroup,
  SelectButton,
} from "@/components/character-select/Button";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/CharacterSelect/Buttons",
  component: SelectButton,
  tags: ["autodocs"],
  args: {
    active: true,
    children: "남성",
    size: "md",
    disabled: false,
    onClick: () => undefined,
  },
  decorators: [
    (Story) => (
      <StoryCanvas className="w-[420px]">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof SelectButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variant: Story = {
  args: {
    active: false,
    children: "여성",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "blue",
  },
};

export const Disabled: Story = {
  args: {
    active: false,
    children: "잠김",
    disabled: true,
  },
};

export const Group: Story = {
  render: () => (
    <ButtonGroup>
      <SelectButton active onClick={() => undefined}>
        남성
      </SelectButton>
      <SelectButton active={false} onClick={() => undefined}>
        여성
      </SelectButton>
      <SelectButton active={false} size="sm" onClick={() => undefined}>
        gray
      </SelectButton>
    </ButtonGroup>
  ),
};

export const Action: Story = {
  render: () => (
    <ActionButton onClick={() => undefined}>캐릭터 저장</ActionButton>
  ),
};
