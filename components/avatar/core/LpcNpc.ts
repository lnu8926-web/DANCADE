
import { AvatarManager } from "@/game/managers/global/AvatarManager";
import { MainScene } from "@/game/scenes/core/MainScene";
import { getEventGame } from "@/lib/supabase/event"

export type NpcType = 'MERCHANT' | 'VILLAGER' | 'EVENT';

interface NpcData {
  name: string;
  defaultSprite: string;
  idleMessages: string[];
  idleMessagesGuest: string[];
  interaction: (scene: MainScene, npcSprite: AvatarManager) => void;
}

export const NPC_CONFIG: Record<NpcType, NpcData> = {
  MERCHANT: {
    name: "상인",
    defaultSprite: "male",
    idleMessages: [
      "어서오세요! 아바타를 꾸며보세요 ✨",
      "포인트를 모아 나만의 스타일로!",
      "신상 아이템이 들어왔어요!",
      "게임을 이기면 포인트를 얻을 수 있어요 🎮",
    ],
    idleMessagesGuest: [
      "회원가입하면 아이템을 구매할 수 있어요!",
      "로그인 후 포인트로 아바타를 꾸며보세요 🎁",
      "게스트 포인트는 회원가입 시 이어받을 수 있어요!",
    ],
    interaction: (scene, npc) => {
      scene.uiManager.showSpeechBubble(npc, "어떤 아이템을 찾으세요?", 500);

      scene.time.delayedCall(600, () => {
        window.dispatchEvent(new CustomEvent("shop:open"));
      });
    }
  },
  VILLAGER: {
    name: "랭킹 NPC",
    defaultSprite: "female",
    idleMessages: [
      "오늘의 1위는 누굴까요? 🏆",
      "랭킹에 도전해보세요!",
      "게임에서 이기고 상위권을 노려봐요",
      "지금 랭킹 1등은 얼마나 강할까요?",
    ],
    idleMessagesGuest: [
      "게스트도 랭킹을 조회할 수 있어요!",
      "랭킹에 이름을 올리려면 회원가입이 필요해요",
      "실력을 쌓고 회원으로 도전해보세요 🏆",
    ],
    interaction: (scene, npc) => {
      scene.uiManager.showSpeechBubble(npc, "랭킹을 확인해볼까요?", 500);

      scene.time.delayedCall(600, () => {
        window.dispatchEvent(new CustomEvent("ranking:open"));
      });
    }
  },
  EVENT: {
    name: "이벤트 NPC",
    defaultSprite: "male",
    idleMessages: [
      "이벤트에 참여하면 포인트 GET! 🎁",
      "매일 새로운 이벤트가 열려요",
      "도전해서 포인트를 획득하세요!",
      "오늘의 이벤트, 참여해보셨나요?",
    ],
    idleMessagesGuest: [
      "게스트도 이벤트에 참여할 수 있어요!",
      "포인트를 모아 회원가입 시 이어받아요 🎁",
      "매일 이벤트로 포인트를 쌓아보세요!",
    ],
    interaction: async (scene, npc) => {
      const { data } = await getEventGame();

      if (data) {
        switch(data.game_type) {
          case 'rock_paper_scissors':
            scene.uiManager.showGameUI(npc);
            break;
          case 'consonant_quiz':
            const {consonant, result, hint} = data.details
            scene.uiManager.showConsonantQuizUI(npc, consonant, result, hint);
            break;
        }
      } else {
        scene.uiManager.showSpeechBubble(npc, "진행중인 이벤트가 없습니다.", 2000);
      }
    }
  }
};