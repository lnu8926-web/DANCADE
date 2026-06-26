"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { useCallback, useState, useEffect } from "react";

import { useAuth } from "@/hooks/auth/useAuth";
import { useCharacterSave } from "@/hooks/character/useCharacterSave";
import { useCharacterCustomization } from "@/hooks/useCharacterCustomization";
import { useCharacterStorage } from "@/hooks/useCharacterStorage";
import { useGuestAuth } from "@/hooks/useGuestAuth";
import { useLPCData } from "@/hooks/useLPCData";

import { ActionButton } from "@/components/character-select/Button";
import { CustomizationPanel } from "@/components/character-select/CustomizationPanel";
import { ErrorScreen } from "@/components/character-select/Error";
import { LoadingScreen } from "@/components/character-select/Loading";
import Window from "@/components/common/Window";
import { useToast } from "@/components/common/ToastProvider";

import { getItemById } from "@/lib/supabase/item";
import { saveItemToInventory } from "@/lib/supabase/inventory";

const AvatarPreview = dynamic(
  () => import("@/components/avatar/ui/AvatarPreview"),
  { ssr: false },
);

export default function CharacterSelect() {
  const router = useRouter();
  const [isAssetLoading, setIsAssetLoading] = useState(true);
  const { getCurrentUser } = useAuth();
  const { getStoredUser, getOrCreateGuestUser } = useGuestAuth();
  const { saveCharacter } = useCharacterSave();
  const { saveCharacterLocal } = useCharacterStorage();

  const { showToast } = useToast();
  const { lpcData, isLoading, error } = useLPCData();
  const {
    customization,
    setCustomization,
    handleRandomize,
    handleGenderChange,
  } = useCharacterCustomization(lpcData);

  useEffect(() => {
    const memberUser = getCurrentUser();
    const guestUser = getStoredUser();

    if (!memberUser && !guestUser) router.push("/auth/login/id");
      
  }, [getCurrentUser, getStoredUser, router]);

  const handleAvatarLoaded = useCallback(() => {
    setIsAssetLoading(false);
  }, []);

  const handleStartGame = useCallback(async () => {
    if (!customization) return;

    saveCharacterLocal(customization);

    const memberUser = getCurrentUser();

    if (memberUser) {
      const result = await saveCharacter(memberUser.id, customization);

      if (!result) {
        showToast({ type: "error", message: "캐릭터 저장에 실패했습니다." });
        return;
      } else {
        const parts = customization.parts;
        const partKeys = ["hair", "torso", "legs", "feet"] as const;

        await Promise.all(
          partKeys.map(async (key) => {
            const styleId = parts[key]?.styleId;
            if (!styleId) return;

            const data = await getItemById(styleId);
            const id = data?.[0]?.id;
            if (id) {
              await saveItemToInventory(memberUser.id, id);
            }
          }),
        );
      }
    }

    if (!memberUser) getOrCreateGuestUser();

    router.push("/game");
  }, [
    customization,
    getCurrentUser,
    router,
    saveCharacter,
    saveCharacterLocal,
    getOrCreateGuestUser,
    showToast,
  ]);

  if (isLoading || !customization) return <LoadingScreen />;

  if (error || !lpcData) return <ErrorScreen error={error} />;

  const previewState = customization;

  return (
    <Window title="character">
      <div className="w-full">
        <div className="flex w-full  text-white font-neo">
          <div className="w-1/2 flex flex-col items-center justify-center p-10">
            <div className="w-[400px] h-[400px] border-[3px] border-(--color-slate-gray) rounded-lg bg-(--color-midnight) overflow-hidden relative">
              {isAssetLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <AvatarPreview
                customization={previewState}
                onLoad={handleAvatarLoaded}
              />
            </div>

            <div className="flex gap-[15px] mt-[30px]">
              <ActionButton onClick={handleRandomize}>랜덤 생성</ActionButton>
              <ActionButton onClick={handleStartGame}>게임 시작</ActionButton>
            </div>
          </div>

          <div className="w-1/2 p-10 max-h-[700px] overflow-y-auto">
            <CustomizationPanel
              lpcData={lpcData}
              customization={customization}
              onChange={setCustomization}
              onGenderChange={handleGenderChange}
            />
          </div>
        </div>
      </div>
    </Window>
  );
}
