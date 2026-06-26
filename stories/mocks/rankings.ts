import type { RankingItem } from "@/components/ranking/RankingBoard";

export const mockRankings: RankingItem[] = [
  { id: 1,  score: 12400, users: { nickname: "DANA" } },
  { id: 2,  score: 10820, users: { nickname: "PIXEL" } },
  { id: 3,  score: 9950,  users: { nickname: "ARCADE" } },
  { id: 4,  score: 8200,  users: { nickname: "GUEST_77" } },
  { id: 5,  score: 7600,  users: { nickname: "NEON" } },
  { id: 6,  score: 6840,  users: { nickname: "RETRO" } },
  { id: 7,  score: 5910,  users: { nickname: "BYTE" } },
  { id: 8,  score: 5200,  users: { nickname: "Player001" } },
  { id: 9,  score: 4750,  users: { nickname: "뿡뿡이" } },
  { id: 10, score: 4100,  users: { nickname: "JOYSTICK" } },
];

export const emptyRankings: RankingItem[] = [];
