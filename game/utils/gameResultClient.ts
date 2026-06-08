import { getUserDataFromLocal } from "@/lib/utils/auth";

interface AiResultPayload {
  gameType: string;
  userWon: boolean;
  duration: number;
  points: number;
  userId?: string;
}

interface BrickBreakerScorePayload {
  score: number;
  elapsedTime: number;
  bricksDestroyed: number;
  isWin: boolean;
  lives: number;
}

interface BrickBreakerRequest {
  data: BrickBreakerScorePayload;
  sessionId: string;
  userId?: string;
}

function resolveUserId(fallbackUserId?: string): string | null {
  if (fallbackUserId) return fallbackUserId;

  const user = getUserDataFromLocal();
  return user?.uuid || user?.userId || null;
}

async function postJson<TBody>(url: string, body: TBody): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function submitAiGameResult(payload: AiResultPayload): Promise<void> {
  const userId = resolveUserId(payload.userId);

  if (!userId) {
    throw new Error("Missing userId for AI result submission");
  }

  const response = await postJson("/api/game-result/ai", {
    gameType: payload.gameType,
    userId,
    userWon: payload.userWon,
    duration: payload.duration,
    points: payload.points,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
}

export async function submitBrickBreakerScore(
  request: BrickBreakerRequest
): Promise<unknown> {
  const userId = resolveUserId(request.userId);

  if (!userId) {
    throw new Error("Missing userId for brick-breaker score submission");
  }

  const response = await postJson("/api/games/brick-breaker/score", {
    ...request.data,
    userId,
    sessionId: request.sessionId,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  return response.json();
}
