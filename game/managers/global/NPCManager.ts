// game/managers/global/NPCManager.ts
import { AvatarManager } from "@/game/managers/global/AvatarManager";
import { NPC_CONFIG, NpcType } from "@/components/avatar/core/LpcNpc";
import { MainScene } from "@/game/scenes/core/MainScene";

const IDLE_INTERVAL = 12000;
const IDLE_DURATION = 3500;

export class NPCManager {
  private npcs: AvatarManager[] = [];
  private interactKey!: Phaser.Input.Keyboard.Key;
  private idleTimers: Phaser.Time.TimerEvent[] = [];

  constructor(private scene: Phaser.Scene) {}

  // =====================================================================
  // NPC 생성
  // =====================================================================

  createNPCs(): void {
    // 상인 NPC
    const merchant = new AvatarManager(this.scene).createNPC(
      1545,
      241,
      "MERCHANT"
    );

    // 마을 주민 NPC
    const villager = new AvatarManager(this.scene).createNPC(
      1616,
      592,
      "VILLAGER"
    );

    // 이벤트 NPC
    const gambler = new AvatarManager(this.scene).createNPC(1348, 592, "EVENT");

    this.npcs.push(merchant, villager, gambler);

    this.setupIdleMessages([
      { npc: merchant, type: "MERCHANT", startDelay: 4000 },
      { npc: villager, type: "VILLAGER", startDelay: 9000 },
      { npc: gambler,  type: "EVENT",    startDelay: 14000 },
    ]);

    console.log(`✅ NPC ${this.npcs.length}명 생성 완료`);
  }

  // =====================================================================
  // 아이들 말풍선
  // =====================================================================

  private setupIdleMessages(entries: { npc: AvatarManager; type: NpcType; startDelay: number }[]): void {
    const mainScene = this.scene as MainScene;

    entries.forEach(({ npc, type, startDelay }) => {
      const messages = NPC_CONFIG[type].idleMessages;
      let index = 0;

      const showNext = () => {
        const msg = messages[index % messages.length];
        index++;
        mainScene.uiManager.showSpeechBubble(npc, msg, IDLE_DURATION);
      };

      const timer = this.scene.time.addEvent({
        delay: IDLE_INTERVAL,
        startAt: IDLE_INTERVAL - startDelay,
        loop: true,
        callback: showNext,
      });

      this.idleTimers.push(timer);
    });
  }

  // =====================================================================
  // 상호작용 설정
  // =====================================================================

  setupInteraction(player: AvatarManager): void {
    if (!this.scene.input.keyboard) {
      console.warn("키보드 입력이 활성화되지 않았습니다.");
      return;
    }

    this.interactKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    this.interactKey.on("down", () => {
      // 플레이어가 주변 NPC와 상호작용 시도
      player.tryInteract(this.npcs);
    });

    console.log("✅ NPC 상호작용 설정 완료 (E키)");
  }

  // =====================================================================
  // 업데이트
  // =====================================================================

  update(): void {
    // 각 NPC의 업데이트 로직 실행
    this.npcs.forEach((npc) => npc.update());
  }

  // =====================================================================
  // NPC 접근자
  // =====================================================================

  getNPCs(): AvatarManager[] {
    return this.npcs;
  }

  getNPCCount(): number {
    return this.npcs.length;
  }

  // =====================================================================
  // 정리
  // =====================================================================

  cleanup(): void {
    // 모든 NPC 제거
    this.npcs.forEach((npc) => {
      if (npc && npc.destroy) {
        npc.destroy();
      }
    });

    this.npcs = [];

    // 아이들 타이머 제거
    this.idleTimers.forEach((t) => t.remove());
    this.idleTimers = [];

    // 키 이벤트 리스너 제거
    if (this.interactKey) {
      this.interactKey.removeAllListeners();
    }

    console.log("✅ NPC 정리 완료");
  }

  destroy(): void {
    this.cleanup();
  }
}
