import { GameSceneWithState } from "@/types/game";
import { submitAiGameResult } from "@/game/utils/gameResultClient";

export class AiGameOverHandler<TSide = never> {
  private scene: GameSceneWithState<TSide>;
  private gameType: string;
  private basePoints: number;

  constructor(
    scene: GameSceneWithState<TSide>,
    gameType: string,
    basePoints: number = 20
  ) {
    this.scene = scene;
    this.gameType = gameType;
    this.basePoints = basePoints;
  }

  async handle(winner: TSide): Promise<void> {
    const { gameState, startTime } = this.scene;

    // 유저 승리 여부 판단
    const isUserWin = winner === gameState.userSide;

    // 플레이 시간 계산
    const duration = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : 0;

    try {
      const requestData = {
        gameType: this.gameType,
        userId: this.scene.currentUser?.uuid,
        userWon: isUserWin,
        duration: duration,
        points: this.basePoints,
      };

      await submitAiGameResult(requestData);
      console.log(`[${this.gameType}] AI 결과 저장 성공`);
    } catch (error) {
      console.error(`[${this.gameType}] 저장 실패:`, error);
    }
  }
}
