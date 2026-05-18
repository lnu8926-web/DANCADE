"use client";

import Link from "next/link";
import { useRegisterForm } from "@/hooks/auth/useRegisterForm";
import { GuestDataSection } from "./GuestDataSection";
import { FormField, PasswordConfirmField } from "./FormField";

interface RegisterFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export default function RegisterForm({
  onSuccess,
  onCancel,
  isModal = false,
}: RegisterFormProps) {
  const {
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
  } = useRegisterForm({ onSuccess });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = form;

  const userIdValue = watch("userid");
  const nicknameValue = watch("nickname");
  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  const nicknameGenerateButton = (
    <button
      type="button"
      onClick={async () => {
        const newNickname = await generateAvailableNickname();
        setValue("nickname", newNickname, { shouldValidate: true });
        await checkDuplicate("nickname", newNickname, setNicknameCheckStatus);
      }}
      disabled={isGenerating}
      className="px-4 py-2 bg-(--color-pink) text-white font-bold rounded-lg 
        hover:bg-(--color-pink)/90 transition-colors duration-200
        disabled:bg-gray-400 disabled:cursor-not-allowed
        whitespace-nowrap text-sm"
      title="랜덤 닉네임 생성"
    >
      {isGenerating ? "⏳ 생성중..." : "🎲 생성"}
    </button>
  );

  return (
    <form
      className={`signup-form w-full bg-white ${
        isModal ? "" : "max-w-[515px] px-5 py-6"
      }`}
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      <fieldset className="form-fields space-y-6">
        <legend className="sr-only">회원가입 정보 입력</legend>

        <GuestDataSection
          hasGuestData={hasGuestData}
          guestDataSelected={guestDataSelected}
          shouldLoadGuestData={shouldLoadGuestData}
          guestNickname={guestNickname}
          guestPoints={guestPoints}
          onSelectLoadData={(load) => {
            setShouldLoadGuestData(load);
            setGuestDataSelected(true);
          }}
          onReselect={() => setGuestDataSelected(false)}
        />

        <FormField
          id="userid"
          type="text"
          label="아이디"
          placeholder="아이디를 입력하세요."
          autoComplete="username"
          isModal={isModal}
          error={errors.userid?.message}
          checkStatus={userIdCheckStatus}
          showStatusWhen={!!userIdValue}
          minLengthHint={{
            length: 4,
            message: "아이디는 최소 4글자 이상이어야 합니다.",
          }}
          value={userIdValue || ""}
          {...register("userid")}
        />

        <FormField
          id="nickname"
          type="text"
          label="닉네임"
          placeholder="닉네임을 입력하세요."
          autoComplete="nickname"
          isModal={isModal}
          error={errors.nickname?.message}
          checkStatus={nicknameCheckStatus}
          showStatusWhen={!!nicknameValue}
          rightElement={nicknameGenerateButton}
          value={nicknameValue || ""}
          {...register("nickname")}
        />

        <FormField
          id="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력하세요."
          autoComplete="new-password"
          isModal={isModal}
          error={errors.password?.message}
          value={passwordValue || ""}
          {...register("password")}
        />

        <PasswordConfirmField
          id="confirmPassword"
          type="password"
          labelLines={["비밀번호", "확인"]}
          placeholder="비밀번호를 다시 입력하세요."
          autoComplete="new-password"
          isModal={isModal}
          error={errors.confirmPassword?.message}
          value={confirmPasswordValue || ""}
          {...register("confirmPassword")}
        />
      </fieldset>

      {serverError && (
        <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-md text-sm font-bold">
          {serverError}
        </div>
      )}

      <div className="button-group flex gap-3 mt-8 justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={() => {
              unlockInput();
              onCancel();
            }}
            className="pixelBtn pixelBtn--gray text-black font-bold px-6 py-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            취소
          </button>
        ) : (
          <Link
            href="/auth/login/id"
            onClick={unlockInput}
            className="pixelBtn pixelBtn--gray text-black font-bold px-6 py-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            취소
          </Link>
        )}

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="pixelBtn pixelBtn--pink text-black font-bold px-6 py-3 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "가입 중..." : "회원가입"}
        </button>
      </div>
    </form>
  );
}
