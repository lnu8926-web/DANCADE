"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";
import { passwordUtils } from "@/lib/utils/password";
import {
  RegisterData,
  LoginData,
  MemberUser,
  DBUser,
  LocalUser,
  isMemberUser,
} from "@/types/user";
import { STORAGE_KEYS } from "@/constants/auth";

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentUser = useCallback((): MemberUser | null => {
    if (typeof window === "undefined") return null;

    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      if (!userData) return null;

      const parsed: LocalUser = JSON.parse(userData);

      if (isMemberUser(parsed)) {
        return parsed;
      }

      return null;
    } catch (error) {
      console.error("사용자 정보 불러오기 실패:", error);
      return null;
    }
  }, []);

  const checkNicknameDuplicate = useCallback(
    async (nickname: string): Promise<boolean> => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("nickname")
          .eq("nickname", nickname)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        return !!data;
      } catch (error) {
        console.error("닉네임 확인 실패:", error);
        throw new Error("닉네임 중복 확인 중 오류가 발생했습니다.");
      }
    },
    []
  );

  const checkUserIdDuplicate = useCallback(
    async (userid: string): Promise<boolean> => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("userid")
          .eq("userid", userid)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        return !!data;
      } catch (error) {
        console.error("아이디 확인 실패:", error);
        throw new Error("아이디 중복 확인 중 오류가 발생했습니다.");
      }
    },
    []
  );

  const register = useCallback(
    async (data: RegisterData): Promise<DBUser> => {
      setIsLoading(true);

      try {
        const [isUserIdDuplicate, isNicknameDuplicate] = await Promise.all([
          checkUserIdDuplicate(data.userid),
          checkNicknameDuplicate(data.nickname),
        ]);

        if (isUserIdDuplicate) {
          throw new Error("이미 사용 중인 아이디입니다.");
        }

        if (isNicknameDuplicate) {
          throw new Error("이미 사용 중인 닉네임입니다.");
        }

        const hashedPassword = await passwordUtils.hash(data.password);

        const { data: newUser, error } = await supabase
          .from("users")
          .insert({
            userid: data.userid,
            nickname: data.nickname,
            password: hashedPassword,
            total_points: 0,
          })
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            throw new Error("이미 사용 중인 아이디 또는 닉네임입니다.");
          }
          throw error;
        }

        return newUser as DBUser;
      } catch (error) {
        console.error("회원가입 실패:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [checkUserIdDuplicate, checkNicknameDuplicate]
  );

  const login = useCallback(async (data: LoginData): Promise<MemberUser> => {
    setIsLoading(true);

    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("userid", data.userid)
        .single();

      if (error || !user) {
        throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
      }

      const dbUser = user as DBUser;

      const isPasswordValid = await passwordUtils.verify(
        data.password,
        dbUser.password
      );

      if (!isPasswordValid) {
        throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
      }

      const memberData: MemberUser = {
        id: dbUser.id,
        userid: dbUser.userid,
        nickname: dbUser.nickname,
        total_points: dbUser.total_points,
        created_at: dbUser.created_at,
        updated_at: dbUser.updated_at,
        type: "member",
        isGuest: false,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(memberData));
      }

      return memberData;
    } catch (error) {
      console.error("로그인 실패:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    router.push("/");
  }, [router]);

  const isAuthenticated = useCallback((): boolean => {
    const user = getCurrentUser();
    return !!user;
  }, [getCurrentUser]);

  return {
    isLoading,
    register,
    login,
    logout,
    checkNicknameDuplicate,
    checkUserIdDuplicate,
    getCurrentUser,
    isAuthenticated,
  };
};
