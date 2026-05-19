"use client";

import { useCallback } from "react";
import type { CharacterState } from "@/components/avatar/utils/LpcTypes";
import { STORAGE_KEY } from "@/constants/character";

export const useCharacterStorage = () => {
  const saveCharacterLocal = useCallback((customization: CharacterState) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
  }, []);

  const loadCharacterLocal = useCallback((): CharacterState | null => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as CharacterState;
    } catch {
      return null;
    }
  }, []);

  return { saveCharacterLocal, loadCharacterLocal };
};
