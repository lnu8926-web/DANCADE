import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const isDev = process.env.NODE_ENV !== "production";

// ⭐ 환경 변수 체크 (클라이언트 생성 전에!)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚨 Supabase 환경변수 확인:", {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? "✅" : "❌",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? "✅" : "❌",
  });
  throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
}

/**
 * Supabase 클라이언트 (브라우저/서버 공용)
 * - 브라우저: 자동 세션 관리
 * - 서버: API Route에서 사용
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

if (isDev) {
  console.log("✅ Supabase 클라이언트 생성 완료:", {
    url: supabaseUrl.substring(0, 30) + "...",
    keyLength: supabaseAnonKey.length,
  });
}

/**
 * 서버 전용 Supabase 클라이언트
 * - Service Role Key 사용 (RLS 우회)
 * - API Route/서버 액션에서만 사용
 */
export function createServerClient() {
  // ⭐ anon key 먼저 시도 (개발 단계)
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseServiceKey) {
    console.error("🚨 서버 클라이언트 키 없음:", {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? "✅"
        : "❌",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "✅"
        : "❌",
    });
    throw new Error("Supabase 서버 키가 설정되지 않았습니다.");
  }

  if (isDev) {
    console.log("🔧 서버 클라이언트 생성:", {
      url: supabaseUrl.substring(0, 30) + "...",
      keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon",
      keyLength: supabaseServiceKey.length,
    });
  }

  return createClient(supabaseUrl!, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
