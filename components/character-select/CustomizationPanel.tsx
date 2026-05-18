import { useCallback } from "react";
import { Section } from "./Section";
import { ButtonGroup, SelectButton } from "./Button";
import type { CharacterState, LpcSprite, PartStyle } from "@/components/avatar/utils/LpcTypes";
import { LpcSpriteManager } from "@/game/managers/global/LpcSpriteManager";

interface CustomizationPanelProps {
  lpcData: LpcSprite;
  customization: CharacterState;
  onChange: React.Dispatch<React.SetStateAction<CharacterState | null>>;
  onGenderChange: (gender: "male" | "female") => void;
}

export function CustomizationPanel({
  lpcData,
  customization,
  onChange,
  onGenderChange,
}: CustomizationPanelProps) {
  const lpcSpriteManager = new LpcSpriteManager();
  const { palettes } = lpcData.definitions;
  const { assets } = lpcData;
  const gender = customization.gender as "male" | "female";

  const filterBasic = <T extends { tier?: string }>(styles: T[]) =>
  styles.filter((style) => style.tier === "basic");

  const availableHairStyles = filterBasic(
  lpcSpriteManager.getAssetsByPart(lpcData, "hair", gender)
);

const availableTorsoStyles = filterBasic(
  lpcSpriteManager.getAssetsByPart(lpcData, "torso", gender)
);

const availableLegsStyles = filterBasic(
  lpcSpriteManager.getAssetsByPart(lpcData, "legs", gender)
);



  const handleChange = useCallback(
    <T extends keyof CharacterState["parts"]>(
      part: T,
      value: { styleId?: string; color?: string }
    ) => {
      onChange((prev) => {
        if (!prev || !prev.parts) return prev;

        const prevPart = prev.parts[part] || {};

        const newPart = {
          ...prevPart,
          ...value,
        };

        return {
          ...prev,
          parts: {
            ...prev.parts,
            [part]: newPart,
          },
        } as CharacterState;
      });
    },
    [onChange]
  );

  return (
    <div>
      <h2 className="text-2xl mb-[30px]">외모 커스터마이징</h2>

      <Section title="성별">
        <ButtonGroup>
          <SelectButton
            active={customization.gender === "male"}
            onClick={() => onGenderChange("male")}
          >
            남성
          </SelectButton>
          <SelectButton
            active={customization.gender === "female"}
            onClick={() => onGenderChange("female")}
          >
            여성
          </SelectButton>
        </ButtonGroup>
      </Section>

      <Section title="피부색">
        <ButtonGroup>
          {palettes.skin_common.slice(0, 10).map((color: string) => (
            <SelectButton
              key={color}
              active={customization.parts.body?.color === color}
              onClick={() => {
                handleChange("body", { color })
                handleChange("head", { color })
                handleChange("nose", { color })
              }}
            >
              {color}
            </SelectButton>
          ))}
        </ButtonGroup>
      </Section>

      <Section title="눈 색상">
        <ButtonGroup>
          {palettes.eye_common.slice(0, 12).map((color: string) => (
            <SelectButton
              key={color}
              active={customization.parts.eyes?.color === color}
              onClick={() => handleChange("eyes", { color: color })}
            >
              {color}
            </SelectButton>
          ))}
        </ButtonGroup>
      </Section>

      <Section title="헤어 스타일">
        <ButtonGroup>
          {availableHairStyles.map((style: PartStyle) => (
            <SelectButton
              key={style.id}
              active={customization.parts.hair?.styleId === style.id}
              onClick={() => handleChange("hair", { styleId: style.id })}
            >
              {style.name || style.id}
            </SelectButton>
          ))}
        </ButtonGroup>
      </Section>

      <Section title="헤어 색상">
        <ButtonGroup>
          {palettes.hair_common.slice(0, 12).map((color: string) => (
            <SelectButton
              key={color}
              active={customization.parts.hair?.color === color}
              onClick={() => handleChange("hair", { color: color })}
            >
              {color}
            </SelectButton>
          ))}
        </ButtonGroup>
      </Section>

      <Section title="상의 스타일">
        <ButtonGroup>
          {availableTorsoStyles.map((style) => (
            <SelectButton
              key={style.id}
              active={customization.parts.torso?.styleId === style.id}
              onClick={() => handleChange("torso", { styleId: style.id })}
            >
              {style.name || style.id}
            </SelectButton>
          ))}
        </ButtonGroup>
      </Section>

      <Section title="상의 색상">
        <ButtonGroup>
          {palettes.clothes_common.slice(0, 12).map((color: string) => (
            <SelectButton
              key={color}
              active={customization.parts.torso?.color === color}
              onClick={() => handleChange("torso", { color: color })}
            >
              {color}
            </SelectButton>
          ))}
        </ButtonGroup>
      </Section>

      <Section title="하의 스타일">
        <ButtonGroup>
          {availableLegsStyles.map((style) => (
            <SelectButton
              key={style.id}
              active={customization.parts.legs?.styleId === style.id}
              onClick={() => handleChange("legs", { styleId: style.id })}
            >
              {style.name || style.id}
            </SelectButton>
          ))}
        </ButtonGroup>
      </Section>

      <Section title="하의 색상">
        <ButtonGroup>
          {palettes.clothes_common.slice(0, 12).map((color: string) => (
            <SelectButton
              key={color}
              active={customization.parts.legs?.color === color}
              onClick={() => handleChange("legs", { color: color })}
            >
              {color}
            </SelectButton>
          ))}
        </ButtonGroup>
      </Section>

       <Section title="신발 색상">
        <ButtonGroup>
          {palettes.clothes_common.slice(0, 12).map((color: string) => (
            <SelectButton
              key={color}
              active={customization.parts.feet?.color === color}
              onClick={() => handleChange("feet", { color: color })}
            >
              {color}
            </SelectButton>
          ))}
        </ButtonGroup>
      </Section>
    </div>
  );
}
