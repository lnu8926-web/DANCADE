import { getServerApiBaseUrl } from "@/lib/config/runtime";

export type EventGameType = 'rock_paper_scissors' | 'consonant_quiz'; 

interface EventGameProps {
  gameType: EventGameType;
  content: string;
  details: any | undefined;
}

interface ResultProps {
  data: {
    game_type: EventGameType
    details: {
      hint: string, 
      result: string, 
      consonant: string
    }
  }
}

function resolveEventGameUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/event/game";
  }

  return `${getServerApiBaseUrl()}/api/event/game`;
}

// Project Info API
export async function getEventGame(): Promise<ResultProps> {
  try {
    const url = resolveEventGameUrl();
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Event game fetch failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.error("[getEventGame]", err);
    throw err;
  }
}