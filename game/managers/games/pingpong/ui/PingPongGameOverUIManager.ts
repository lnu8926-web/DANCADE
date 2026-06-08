// game/managers/games/pingpong/ui/PingPongGameOverUIManager.ts

import { PingPongGameResult } from "@/game/types/pingpong";
import { BaseEndGameUI } from "@/game/managers/base";

/**
 * 핑퐁 게임 종료 화면 UI 관리
 * - 게임 오버 화면
 * - 최종 점수 표시
 * - 게임 통계 표시
 */
export class PingPongGameOverUIManager {
  private scene: Phaser.Scene;
  private endGameUI: BaseEndGameUI;

  private readonly TEXT_STYLE = {
    FINAL_SCORE: {
      fontFamily: '"Press Start 2P"',
      fontSize: "32px",
      color: "#ffffff",
    },
    LABEL: {
      fontFamily: '"Press Start 2P"',
      fontSize: "14px",
      color: "#95a5a6",
    },
    STATS: {
      fontFamily: '"Press Start 2P"',
      fontSize: "10px",
      color: "#95a5a6",
    },
    BUTTON: {
      fontFamily: '"Press Start 2P"',
      fontSize: "14px",
      color: "#ffffff",
    },
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.endGameUI = new BaseEndGameUI(scene);
  }

  // =====================================================================
  // 게임 오버 화면
  // =====================================================================

  showGameOverScreen(
    isPlayerWin: boolean,
    playerScore: number,
    aiScore: number,
    onRestart: () => void,
    onHome: () => void,
    gameResult?: PingPongGameResult
  ): void {
    const winner = isPlayerWin ? "YOU WIN!" : "GAME OVER";

    this.endGameUI.show({
      title: winner,
      titleColor: isPlayerWin ? "#2ecc71" : "#e74c3c",
      overlayAlpha: 0.7,
      animation: isPlayerWin
        ? { type: "scale", value: 1.1, duration: 300 }
        : { type: "alpha", value: 0.3, duration: 500 },
      titleY: 200,
      restartY: 440,
      homeY: 520,
      restartLabel: "RESTART",
      homeLabel: "HOME",
      onRestart,
      onHome,
      renderContent: ({ scene, depth, centerX }) => {
        const elements = this.createFinalScoreDisplay(
          scene,
          centerX,
          playerScore,
          aiScore,
          depth
        );

        if (gameResult) {
          elements.push(...this.createGameStats(scene, centerX, gameResult, depth));
        }

        return elements;
      },
    });
  }

  // =====================================================================
  // UI 컴포넌트
  // =====================================================================

  private createFinalScoreDisplay(
    scene: Phaser.Scene,
    centerX: number,
    playerScore: number,
    aiScore: number,
    depth: number
  ): Phaser.GameObjects.GameObject[] {
    const playerLabel = scene.add
      .text(centerX, 280, "PLAYER", this.TEXT_STYLE.LABEL)
      .setOrigin(0.5)
      .setDepth(depth + 1);

    const scoreText = scene.add
      .text(
        centerX,
        320,
        `${playerScore} - ${aiScore}`,
        this.TEXT_STYLE.FINAL_SCORE
      )
      .setOrigin(0.5)
      .setDepth(depth + 1);

    const aiLabel = scene.add
      .text(centerX, 360, "COMPUTER", this.TEXT_STYLE.LABEL)
      .setOrigin(0.5)
      .setDepth(depth + 1);

    return [playerLabel, scoreText, aiLabel];
  }

  private createGameStats(
    scene: Phaser.Scene,
    centerX: number,
    result: PingPongGameResult,
    depth: number
  ): Phaser.GameObjects.GameObject[] {
    const stats = [
      `Rallies: ${result.totalRallies}`,
      `Longest: ${result.longestRally}`,
      `Perfect: ${result.perfectHits}`,
      `Time: ${result.elapsedTime}s`,
    ];

    const startY = 380;
    const statsText = scene.add
      .text(centerX, startY, stats.join("  |  "), this.TEXT_STYLE.STATS)
      .setOrigin(0.5)
      .setDepth(depth + 1);

    return [statsText];
  }

  // =====================================================================
  // 정리
  // =====================================================================

  cleanup(): void {
    this.endGameUI.cleanup();
  }
}
