import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/hooks/auth/useAuth";
import { useGuestAuth } from "@/hooks/useGuestAuth";
import { useDebounce } from "@/hooks/useDebounce";

import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { generateGuestNickname } from "@/lib/utils/guestNickname";
import { supabase } from "@/lib/supabase/client";

export type CheckStatus = "idle" | "checking" | "available" | "duplicate";

interface UseRegisterFormOptions {
  onSuccess?: () => void;
}

export interface UseRegisterFormReturn {
  // Form 관련
  form: ReturnType<typeof useForm<RegisterInput>>;
  isLoading: boolean;
  serverError: string;
  onSubmit: SubmitHandler<RegisterInput>;

  userIdCheckStatus: CheckStatus;
  nicknameCheckStatus: CheckStatus;
  checkDuplicate: (
    field: "userid" | "nickname",
    value: string,
    setStatus: React.Dispatch<React.SetStateAction<CheckStatus>>
  ) => Promise<void>;

  hasGuestData: boolean;
  guestNickname: string;
  guestPoints: number;
  shouldLoadGuestData: boolean;
  guestDataSelected: boolean;
  setShouldLoadGuestData: React.Dispatch<React.SetStateAction<boolean>>;
  setGuestDataSelected: React.Dispatch<React.SetStateAction<boolean>>;

  isGenerating: boolean;
  generateAvailableNickname: () => Promise<string>;
  setNicknameCheckStatus: React.Dispatch<React.SetStateAction<CheckStatus>>;

  handleFocus: () => void;
  handleBlur: () => void;
  unlockInput: () => void;
}

export function useRegisterForm({
  onSuccess,
}: UseRegisterFormOptions = {}): UseRegisterFormReturn {
  const router = useRouter();
  const { register: registerUser, login, isLoading } = useAuth();
  const { getStoredUser, clearGuestData } = useGuestAuth();

  const [serverError, setServerError] = useState<string>("");
  const [hasGuestData, setHasGuestData] = useState<boolean>(false);
  const [guestNickname, setGuestNickname] = useState<string>("");
  const [guestPoints, setGuestPoints] = useState<number>(0);
  const [shouldLoadGuestData, setShouldLoadGuestData] =
    useState<boolean>(false);
  const [guestDataSelected, setGuestDataSelected] = useState<boolean>(false);

  // 중복 체크 상태
  const [userIdCheckStatus, setUserIdCheckStatus] =
    useState<CheckStatus>("idle");
  const [nicknameCheckStatus, setNicknameCheckStatus] =
    useState<CheckStatus>("idle");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const { setValue, watch } = form;
  const userIdValue = watch("userid");
  const nicknameValue = watch("nickname");

  const debouncedUserId = useDebounce(userIdValue, 500);
  const debouncedNickname = useDebounce(nicknameValue, 500);

  const checkDuplicate = useCallback(
    async (
      field: "userid" | "nickname",
      value: string,
      setStatus: React.Dispatch<React.SetStateAction<CheckStatus>>
    ) => {
      const minLength = field === "userid" ? 4 : 2;

      if (!value || value.length < minLength) {
        setStatus("idle");
        return;
      }

      setStatus("checking");
      try {
        const { data, error } = await supabase
          .from("users")
          .select(field)
          .eq(field, value)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        setStatus(data ? "duplicate" : "available");
      } catch (error) {
        console.error(`${field} 중복 확인 실패:`, error);
        setServerError(
          `${
            field === "userid" ? "아이디" : "닉네임"
          } 중복 확인 중 오류가 발생했습니다.`
        );
        setStatus("idle");
      }
    },
    []
  );

  useEffect(() => {
    const user = getStoredUser();
    if (user && user.isGuest) {
      setHasGuestData(true);
      setGuestNickname(user.nickname);
      setGuestPoints(user.points || 0);
    }
  }, [getStoredUser]);

  useEffect(() => {
    if (shouldLoadGuestData && guestNickname) {
      setValue("nickname", guestNickname, { shouldValidate: true });
      setNicknameCheckStatus("checking");
    } else if (!shouldLoadGuestData) {
      setValue("nickname", "", { shouldValidate: true });
      setNicknameCheckStatus("idle");
    }
  }, [shouldLoadGuestData, guestNickname, setValue]);

  useEffect(() => {
    if (debouncedUserId) {
      checkDuplicate("userid", debouncedUserId, setUserIdCheckStatus);
    } else {
      setUserIdCheckStatus("idle");
    }
  }, [debouncedUserId, checkDuplicate]);

  useEffect(() => {
    if (debouncedNickname) {
      checkDuplicate("nickname", debouncedNickname, setNicknameCheckStatus);
    }
  }, [debouncedNickname, checkDuplicate]);

  const generateAvailableNickname = async (): Promise<string> => {
    setIsGenerating(true);
    let newNickname = generateGuestNickname();
    let isAvailable = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isAvailable && attempts < maxAttempts) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("nickname")
          .eq("nickname", newNickname)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (!data) {
          isAvailable = true;
        } else {
          newNickname = generateGuestNickname();
          attempts++;
        }
      } catch (error) {
        console.error("닉네임 생성 중 오류:", error);
        setServerError("닉네임 생성 중 오류가 발생했습니다.");
        break;
      }
    }

    setIsGenerating(false);
    return newNickname;
  };

  const onSubmit: SubmitHandler<RegisterInput> = async (data) => {
    setServerError("");

    if (userIdCheckStatus !== "available") {
      setServerError("아이디 중복 확인이 필요합니다.");
      return;
    }
    if (nicknameCheckStatus !== "available") {
      setServerError("닉네임 중복 확인이 필요합니다.");
      return;
    }

    try {
      const newUser = await registerUser({
        userid: data.userid,
        nickname: data.nickname,
        password: data.password,
      });

      if (shouldLoadGuestData && guestPoints > 0) {
        const totalPoints = newUser.total_points + guestPoints;

        const { error: updateError } = await supabase
          .from("users")
          .update({ total_points: totalPoints })
          .eq("id", newUser.id);

        if (updateError) {
          console.error("포인트 승계 실패:", updateError);
          setServerError(
            "회원가입은 완료되었으나 포인트 승계에 실패했습니다. 고객센터에 문의해주세요."
          );
        }
      }

      clearGuestData();

      await login({
        userid: data.userid,
        password: data.password,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/character-select");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "회원가입에 실패했습니다.";
      setServerError(errorMessage);
    }
  };

  const handleFocus = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("game:input-locked"));
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (document.activeElement?.tagName === "INPUT") return;
      window.dispatchEvent(new Event("game:input-unlocked"));
    }, 10);
  };

  const unlockInput = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("game:input-unlocked"));
    }
  };

  return {
    form,
    isLoading,
    serverError,
    onSubmit,
    userIdCheckStatus,
    nicknameCheckStatus,
    checkDuplicate,
    hasGuestData,
    guestNickname,
    guestPoints,
    shouldLoadGuestData,
    guestDataSelected,
    setShouldLoadGuestData,
    setGuestDataSelected,
    isGenerating,
    generateAvailableNickname,
    setNicknameCheckStatus,
    handleFocus,
    handleBlur,
    unlockInput,
  };
}
