import { NextRequest, NextResponse } from "next/server";

// Perspective API 타입
interface AnalyzeResponse {
  attributeScores: {
    TOXICITY?: { summaryScore: { value: number } };
    SEVERE_TOXICITY?: { summaryScore: { value: number } };
    PROFANITY?: { summaryScore: { value: number } };
  };
}

interface AnalysisResult {
  isBlocked: boolean;
  scores: {
    toxicity: number;
    severeToxicity: number;
    profanity: number;
  };
  reason: string | null;
}

// 독성 점수 기준
const TOXICITY_THRESHOLD = 0.5; // 50% 이상이면 차단
const API_TIMEOUT_MS = 2500;
const CACHE_TTL_MS = 5 * 60 * 1000;
const analysisCache = new Map<string, { value: AnalysisResult; expiresAt: number }>();

function buildAnalysisResult(data: AnalyzeResponse): AnalysisResult {
  const toxicityScore = data.attributeScores?.TOXICITY?.summaryScore?.value ?? 0;
  const severeToxicityScore =
    data.attributeScores?.SEVERE_TOXICITY?.summaryScore?.value ?? 0;
  const profanityScore = data.attributeScores?.PROFANITY?.summaryScore?.value ?? 0;

  const isBlocked =
    toxicityScore > TOXICITY_THRESHOLD ||
    severeToxicityScore > 0.5 ||
    profanityScore > 0.6;

  return {
    isBlocked,
    scores: {
      toxicity: toxicityScore,
      severeToxicity: severeToxicityScore,
      profanity: profanityScore,
    },
    reason: isBlocked ? "부적절한 내용이 감지되었습니다." : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { comment } = await request.json();

    if (!comment || typeof comment !== "string") {
      return NextResponse.json(
        { error: "유효한 메시지가 필요합니다." },
        { status: 400 }
      );
    }

    const normalizedComment = comment.trim();
    if (!normalizedComment) {
      return NextResponse.json(
        {
          isBlocked: false,
          scores: { toxicity: 0, severeToxicity: 0, profanity: 0 },
          reason: null,
        },
        { status: 200 }
      );
    }

    const now = Date.now();
    const cached = analysisCache.get(normalizedComment);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.value, { status: 200 });
    }

    if (cached && cached.expiresAt <= now) {
      analysisCache.delete(normalizedComment);
    }

    if (!process.env.PERSPECTIVE_API_KEY) {
      return NextResponse.json(
        {
          isBlocked: false,
          scores: { toxicity: 0, severeToxicity: 0, profanity: 0 },
          reason: null,
        },
        { status: 200 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    // Perspective API 호출
    const response = await fetch(
      "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=" +
        process.env.PERSPECTIVE_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: { text: normalizedComment },
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            PROFANITY: {},
          },
          languages: ["ko"],
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `API 분석 실패: ${response.status} ${response.statusText}` },
        { status: 500 }
      );
    }

    const data: AnalyzeResponse = await response.json();

    const result = buildAnalysisResult(data);
    analysisCache.set(normalizedComment, {
      value: result,
      expiresAt: now + CACHE_TTL_MS,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "분석 요청 시간 초과" }, { status: 504 });
    }

    console.error("[chat/analyze]", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
