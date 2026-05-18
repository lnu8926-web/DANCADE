import { useCallback, useEffect, useState } from "react";

import type { CharacterState, LpcSprite } from "@/components/avatar/utils/LpcTypes";
import { LpcSpriteManager } from "@/game/managers/global/LpcSpriteManager";

export function useCharacterCustomization(lpcData: LpcSprite | null) {
  const lpcSpriteManager = new LpcSpriteManager();
  const [customization, setCustomization] = useState<CharacterState | null>(
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!lpcData) return;

    try {
      const safeInitial = lpcSpriteManager.getInitialPart(lpcData);
      setCustomization(safeInitial);
      setIsInitialized(true);
    } catch (error) {
      console.error("기본 아바타값 생성 실패:", error);
      setIsInitialized(true);
    }
  }, [lpcData]);

  const handleRandomize = useCallback(() => {
    if (!lpcData || !customization) return;

    try {
      const randomCustomization = lpcSpriteManager.getRandomPart(lpcData);
      setCustomization(randomCustomization);
    } catch (error) {
      console.error("랜덤 생성에 실패했습니다:", error);
    }
  }, [lpcData, customization]);

  const handleGenderChange = useCallback(
    (gender: "male" | "female") => {
      if (!lpcData || !customization) return;

      const hairStyles = lpcSpriteManager.getAssetsByPart(lpcData, "hair", gender);

      if (hairStyles.length === 0) {
        console.warn("성별에 맞는 헤어스타일이 없습니다:", gender);
        return;
      }

      const firstHair = hairStyles[0];
      const defaultColor =
        lpcData.definitions.palettes.hair_common[0] || "black";

      setCustomization((prev) => {
        if (!prev) return null;

        const currentHair = prev.parts.hair || {};

        return {
          ...prev,
          gender: gender,
          parts: {
            ...prev.parts,
            hair: {
              styleId: firstHair.id,
              color: currentHair.color || defaultColor,
            },
          },
        } as CharacterState;
      });
    },
    [lpcData, customization]
  );

  return {
    customization,
    setCustomization,
    isInitialized,
    handleRandomize,
    handleGenderChange,
  };
}
