// game/managers/games/brickbreaker/BrickBreakerUIManager.ts

import { BaseUIManager } from "@/game/managers/base";
import { GameResult } from "./BrickBreakerGameManager";
import { PauseOverlayManager } from "@/game/managers/base";
import { BaseEndGameUI } from "@/game/managers/base";

/**
 * 벽돌깨기 UI 관리
 */
export class BrickBreakerUIManager extends BaseUIManager {
  // ✅ 추가: 게임 크기 상수
  private readonly GAME_WIDTH = 800;
  private readonly GAME_HEIGHT = 600;

  private scoreText?: Phaser.GameObjects.Text;
  private livesText?: Phaser.GameObjects.Text;
  private lifeIcons: Phaser.GameObjects.Text[] = []; // ✅ 추가: 하트 아이콘
  private pauseButton?: Phaser.GameObjects.Text;
  private pauseOverlayManager?: PauseOverlayManager;
  private endGameUI: BaseEndGameUI;
  private isPauseScreenShown: boolean = false;
  private onPauseToggle?: () => void;
  private onPauseResume?: () => void;
  private onPauseGoLobby?: () => void;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.endGameUI = new BaseEndGameUI(scene);
  }

  setPauseToggleCallback(callback: () => void): void {
    this.onPauseToggle = callback;
  }

  setPauseMenuCallbacks(callbacks: {
    onResume: () => void;
    onGoLobby: () => void;
  }): void {
    this.onPauseResume = callbacks.onResume;
    this.onPauseGoLobby = callbacks.onGoLobby;
  }

  createGameUI(): void {
    this.createScoreText();
    this.createLivesDisplay();
    this.createPauseButton();
    this.pauseOverlayManager = new PauseOverlayManager(this.scene);
  }

  private createScoreText(): void {
    this.scoreText = this.scene.add.text(16, 16, "SCORE: 0", {
      fontFamily: '"Press Start 2P"',
      fontSize: "24px",
      color: "#f1c40f",
      stroke: "#000000",
      strokeThickness: 4,
    });
  }

  private createLivesDisplay(): void {
    const startX = this.GAME_WIDTH - 200;
    const startY = 20;

    // "LIVES:" 텍스트
    this.livesText = this.scene.add.text(startX, startY, "LIVES:", {
      fontFamily: '"Press Start 2P"',
      fontSize: "16px",
      color: "#f1c40f",
      stroke: "#000000",
      strokeThickness: 3,
    });

    // 하트 아이콘 3개
    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.scene.add.text(startX + 90 + i * 35, startY, "♥", {
        fontSize: "24px",
        color: "#e74c3c",
      });
      this.lifeIcons.push(heart);
    }
  }

  updateScore(score: number): void {
    this.scoreText?.setText(`SCORE: ${score}`);
  }

  updateLives(lives: number): void {
    // 하트 아이콘 업데이트
    this.lifeIcons?.forEach((icon, index) => {
      icon.setAlpha(index < lives ? 1 : 0.3);
    });
  }

  private createPauseButton(): void {
    this.pauseButton = this.scene.add
      .text(this.GAME_WIDTH - 20, this.GAME_HEIGHT - 20, "⏸", {
        // ✅ 수정
        fontFamily: "Arial",
        fontSize: "36px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 10, y: 8 },
      })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(5);

    // 호버 효과
    this.pauseButton.on("pointerover", () => {
      this.pauseButton?.setStyle({ backgroundColor: "#555555" });
    });

    this.pauseButton.on("pointerout", () => {
      this.pauseButton?.setStyle({ backgroundColor: "#333333" });
    });

    this.pauseButton.on("pointerdown", () => {
      this.onPauseToggle?.();
    });
  }

  togglePauseScreen(isPaused?: boolean): void {
    if (isPaused !== undefined) {
      if (isPaused && !this.isPauseScreenShown) {
        this.showPauseScreen();
        this.pauseButton?.setText("▶"); // ✅ 추가
      } else if (!isPaused && this.isPauseScreenShown) {
        this.hidePauseScreen();
        this.pauseButton?.setText("⏸"); // ✅ 추가
      }
    } else {
      if (this.isPauseScreenShown) {
        this.hidePauseScreen();
        this.pauseButton?.setText("⏸");
      } else {
        this.showPauseScreen();
        this.pauseButton?.setText("▶");
      }
    }
  }

  private showPauseScreen(): void {
    this.pauseOverlayManager?.show(
      {
        centerX: this.GAME_WIDTH / 2,
        centerY: this.GAME_HEIGHT / 2,
        width: this.GAME_WIDTH,
        height: this.GAME_HEIGHT,
      },
      {
        onResume: () => this.onPauseResume?.(),
        onGoLobby: () => this.onPauseGoLobby?.(),
      }
    );

    this.isPauseScreenShown = true;
  }

  private hidePauseScreen(): void {
    this.pauseOverlayManager?.hide();

    this.isPauseScreenShown = false;
  }

  showEndGameScreen(
    result: GameResult,
    score: number,
    onRestart: () => void,
    onHome: () => void
  ): void {
    const config = this.getEndGameConfig(result);

    this.endGameUI.show({
      title: config.mainText,
      titleColor: config.mainColor,
      overlayAlpha: config.overlayAlpha,
      animation: config.animation,
      titleY: 200,
      restartY: 400,
      homeY: 480,
      restartLabel: "RETRY",
      homeLabel: "HOME",
      onRestart,
      onHome,
      renderContent: ({ scene, depth, centerX }) =>
        this.createScoreDisplay(scene, centerX, score, depth),
    });
  }

  private getEndGameConfig(result: GameResult) {
    const configs = {
      win: {
        mainText: "YOU WIN!",
        mainColor: "#2ecc71",
        overlayAlpha: 0.6,
        animation: { type: "scale" as const, value: 1.1, duration: 300 },
      },
      gameOver: {
        mainText: "GAME OVER",
        mainColor: "#e74c3c",
        overlayAlpha: 0.7,
        animation: { type: "alpha" as const, value: 0.3, duration: 500 },
      },
    };

    return configs[result];
  }

  private createScoreDisplay(
    scene: Phaser.Scene,
    centerX: number,
    score: number,
    depth: number
  ): Phaser.GameObjects.GameObject[] {
    const scoreLabel = scene.add
      .text(centerX, 280, "SCORE", {
        fontFamily: '"Press Start 2P"',
        fontSize: "14px",
        color: "#95a5a6",
      })
      .setOrigin(0.5)
      .setDepth(depth + 1);

    const scoreValue = scene.add
      .text(centerX, 320, `${score}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "32px",
        color: "#f1c40f",
      })
      .setOrigin(0.5)
      .setDepth(depth + 1);

    return [scoreLabel, scoreValue];
  }

  cleanup(): void {
    // ✅ 추가: 일시정지 화면도 정리
    this.hidePauseScreen();
    this.pauseOverlayManager?.cleanup();
    this.endGameUI.cleanup();
    // ✅ 추가: 하트 아이콘 정리
    this.lifeIcons.forEach((icon) => icon.destroy());
    this.lifeIcons = [];
  }
}
