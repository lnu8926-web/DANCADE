import type { Toast } from "@/game/types/toast";

export const mockToasts: Toast[] = [
  { id: "success", type: "success", message: "구매가 완료되었습니다!" },
  { id: "info", type: "info", message: "회원 가입 후 진행해주세요." },
  { id: "error", type: "error", message: "포인트가 부족합니다." },
];
