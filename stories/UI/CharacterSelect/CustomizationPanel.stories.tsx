import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { CustomizationPanel } from "@/components/character-select/CustomizationPanel";
import type { CharacterState, LpcSprite } from "@/components/avatar/utils/LpcTypes";
import lpcData from "@/public/assets/lpc_assets.json";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const mockCustomization: CharacterState = {
  gender: "male",
  parts: {
    body: { color: "light" },
    head: { color: "light" },
    nose: { color: "light" },
    eyes: { color: "blue" },
    hair: { styleId: "plain", color: "black" },
    torso: { styleId: "shortSleeve", color: "white" },
    legs: { styleId: "cuffed", color: "black" },
    feet: { styleId: "shoes", color: "black" },
  },
};

const meta = {
  title: "UI/CharacterSelect/CustomizationPanel",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.ComponentType) => (
      <StoryCanvas className="w-[480px] max-h-[700px] overflow-y-auto">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [customization, setCustomization] = useState<CharacterState | null>(mockCustomization);
    return (
      <CustomizationPanel
        lpcData={lpcData as unknown as LpcSprite}
        customization={customization!}
        onChange={setCustomization}
        onGenderChange={(gender) =>
          setCustomization((prev) => prev ? { ...prev, gender } : prev)
        }
      />
    );
  },
};

export const Female: Story = {
  render: () => {
    const [customization, setCustomization] = useState<CharacterState | null>({
      ...mockCustomization,
      gender: "female",
    });
    return (
      <CustomizationPanel
        lpcData={lpcData as unknown as LpcSprite}
        customization={customization!}
        onChange={setCustomization}
        onGenderChange={(gender) =>
          setCustomization((prev) => prev ? { ...prev, gender } : prev)
        }
      />
    );
  },
};
