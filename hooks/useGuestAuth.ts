"use client";

import { useCallback } from "react";

import { GuestUser, isGuestUser, LocalUser } from "@/types/user";
import { STORAGE_KEYS } from "@/constants/auth";
import { generateGuestNickname } from "@/lib/utils/guestNickname";
import { generateGuestId } from "@/lib/utils/auth";

export const useGuestAuth = () => {
  const getStoredUser = useCallback((): LocalUser | null => {
    if (typeof window === "undefined") return null;

    try {
      const storedData = localStorage.getItem(STORAGE_KEYS.USER);
      if (!storedData) return null;

      const parsed: LocalUser = JSON.parse(storedData);
      return parsed;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  }, []);

  const createNewGuest = useCallback((): GuestUser => {
    const newGuest: GuestUser = {
      id: generateGuestId(),
      nickname: generateGuestNickname(),
      type: "guest",
      isGuest: true,
      points: 0,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newGuest));
    }

    return newGuest;
  }, []);

  const getOrCreateGuestUser = useCallback((): GuestUser => {
    const existingUser = getStoredUser();

    if (existingUser && isGuestUser(existingUser)) {
      return existingUser;
    }

    return createNewGuest();
  }, [getStoredUser, createNewGuest]);

  const clearGuestData = useCallback((): void => {
    if (typeof window === "undefined") return;

    const user = getStoredUser();
    if (user && isGuestUser(user)) {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [getStoredUser]);

  const updateGuestPoints = useCallback(
    (points: number): boolean => {
      if (typeof window === "undefined") return false;

      const user = getStoredUser();
      if (!user || !isGuestUser(user)) return false;

      const updatedGuest: GuestUser = { ...user, points };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedGuest));
      return true;
    },
    [getStoredUser]
  );

  const addGuestPoints = useCallback(
    (amount: number): number => {
      if (typeof window === "undefined") return 0;

      const user = getStoredUser();
      if (!user || !isGuestUser(user)) return 0;

      const newPoints = user.points + amount;
      updateGuestPoints(newPoints);
      return newPoints;
    },
    [getStoredUser, updateGuestPoints]
  );

  const isCurrentUserGuest = useCallback((): boolean => {
    const user = getStoredUser();
    return !!user && isGuestUser(user);
  }, [getStoredUser]);

  return {
    getOrCreateGuestUser,
    getStoredUser,
    createNewGuest,
    clearGuestData,
    updateGuestPoints,
    addGuestPoints,
    isCurrentUserGuest,
  };
};
