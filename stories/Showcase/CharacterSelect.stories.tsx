import type { Meta, StoryObj } from "@storybook/nextjs";
import { ButtonGroup, SelectButton, ActionButton } from "@/components/character-select/Button";
import { Section } from "@/components/character-select/Section";

const meta = {
  title: "Showcase/CharacterSelect",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Calendar: Story = {
  name: "Character Builder",
  render: () => (
    <div className="w-[720px] bg-[#1a1a1a] p-8 font-neo text-white">
      <h2 className="text-2xl mb-[30px]">외모 커스터마이징</h2>
      <Section title="성별">
        <ButtonGroup>
          <SelectButton active onClick={() => undefined}>남성</SelectButton>
          <SelectButton active={false} onClick={() => undefined}>여성</SelectButton>
        </ButtonGroup>
      </Section>
      <Section title="피부색">
        <ButtonGroup>
          {["light", "tan", "brown", "dark"].map((color) => (
            <SelectButton key={color} active={color === "light"} onClick={() => undefined}>
              {color}
            </SelectButton>
          ))}
        </ButtonGroup>
      </Section>
      <Section title="헤어 스타일">
        <ButtonGroup>
          {["plain", "mop", "afro", "idol"].map((style) => (
            <SelectButton key={style} active={style === "plain"} onClick={() => undefined}>
              {style}
            </SelectButton>
          ))}
        </ButtonGroup>
      </Section>
      <div className="mt-8 flex justify-end">
        <ActionButton
          onClick={() => undefined}
          className="bg-[#ffff00] text-black hover:opacity-90"
        >
          저장하고 시작
        </ActionButton>
      </div>
    </div>
  ),
};
