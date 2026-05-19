import { useCallback, useMemo } from "react";
import { Section } from "./Section";
import { ButtonGroup, SelectButton } from "./Button";
import type {
  CharacterState,
  LpcSprite,
  PartStyle,
} from "@/components/avatar/utils/LpcTypes";
import { LpcSpriteManager } from "@/game/managers/global/LpcSpriteManager";

interface CustomizationPanelProps {
  lpcData: LpcSprite;
  customization: CharacterState;
  onChange: React.Dispatch<React.SetStateAction<CharacterState | null>>;
  onGenderChange: (gender: "male" | "female") => void;
}

const filterBasic = <T extends { tier?: string }>(styles: T[]) =>
  styles.filter((style) => style.tier === "basic");

const renderColorSection = (
  title: string,
  colors: string[],
  isActive: (color: string) => boolean,
  onSelect: (color: string) => void,
) => (
  <Section title={title}>
    <ButtonGroup>
      {colors.map((color) => (
        <SelectButton key={color} active={isActive(color)} onClick={() => onSelect(color)}>
          {color}
        </SelectButton>
      ))}
    </ButtonGroup>
  </Section>
);

const renderStyleSection = (
  title: string,
  styles: PartStyle[],
  isActive: (styleId: string) => boolean,
  onSelect: (styleId: string) => void,
) => (
  <Section title={title}>
    <ButtonGroup>
      {styles.map((style) => (
        <SelectButton key={style.id} active={isActive(style.id)} onClick={() => onSelect(style.id)}>
          {style.name || style.id}
        </SelectButton>
      ))}
    </ButtonGroup>
  </Section>
);

export function CustomizationPanel({
  lpcData,
  customization,
  onChange,
  onGenderChange,
}: CustomizationPanelProps) {
  const lpcSpriteManager = useMemo(() => new LpcSpriteManager(), []);
  const { palettes } = lpcData.definitions;
  const gender = customization.gender as "male" | "female";

  const availableHairStyles = useMemo(
    () => filterBasic(lpcSpriteManager.getAssetsByPart(lpcData, "hair", gender)),
    [lpcSpriteManager, lpcData, gender],
  );

  const availableTorsoStyles = useMemo(
    () => filterBasic(lpcSpriteManager.getAssetsByPart(lpcData, "torso", gender)),
    [lpcSpriteManager, lpcData, gender],
  );

  const availableLegsStyles = useMemo(
    () => filterBasic(lpcSpriteManager.getAssetsByPart(lpcData, "legs", gender)),
    [lpcSpriteManager, lpcData, gender],
  );

  const handleChange = useCallback(
    <T extends keyof CharacterState["parts"]>(
      part: T,
      value: { styleId?: string; color?: string },
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
    [onChange],
  );

  return (
    <div>
      <h2 className="text-2xl mb-[30px]">외모 커스터마이징</h2>

      <Section title="성별">
        <ButtonGroup>
          <SelectButton active={customization.gender === "male"} onClick={() => onGenderChange("male")}>
            남성
          </SelectButton>
          <SelectButton active={customization.gender === "female"} onClick={() => onGenderChange("female")}>
            여성
          </SelectButton>
        </ButtonGroup>
      </Section>

      {renderColorSection(
        "피부색",
        palettes.skin_common.slice(0, 10),
        (color) => customization.parts.body?.color === color,
        (color) => {
          handleChange("body", { color });
          handleChange("head", { color });
          handleChange("nose", { color });
        },
      )}

      {renderColorSection(
        "눈 색상",
        palettes.eye_common.slice(0, 12),
        (color) => customization.parts.eyes?.color === color,
        (color) => handleChange("eyes", { color }),
      )}

      {renderStyleSection(
        "헤어 스타일",
        availableHairStyles,
        (styleId) => customization.parts.hair?.styleId === styleId,
        (styleId) => handleChange("hair", { styleId }),
      )}

      {renderColorSection(
        "헤어 색상",
        palettes.hair_common.slice(0, 12),
        (color) => customization.parts.hair?.color === color,
        (color) => handleChange("hair", { color }),
      )}

      {renderStyleSection(
        "상의 스타일",
        availableTorsoStyles,
        (styleId) => customization.parts.torso?.styleId === styleId,
        (styleId) => handleChange("torso", { styleId }),
      )}

      {renderColorSection(
        "상의 색상",
        palettes.clothes_common.slice(0, 12),
        (color) => customization.parts.torso?.color === color,
        (color) => handleChange("torso", { color }),
      )}

      {renderStyleSection(
        "하의 스타일",
        availableLegsStyles,
        (styleId) => customization.parts.legs?.styleId === styleId,
        (styleId) => handleChange("legs", { styleId }),
      )}

      {renderColorSection(
        "하의 색상",
        palettes.clothes_common.slice(0, 12),
        (color) => customization.parts.legs?.color === color,
        (color) => handleChange("legs", { color }),
      )}

      {renderColorSection(
        "신발 색상",
        palettes.clothes_common.slice(0, 12),
        (color) => customization.parts.feet?.color === color,
        (color) => handleChange("feet", { color }),
      )}
    </div>
  );
}
