// game/scenes/games/PingPongScene.ts

import { BaseGameScene } from "@/game/scenes/base";
import {
  PINGPONG_CONFIG,
  PingPongPaddle,
  PingPongBall,
  PingPongGameState,
  PingPongInputState,
  PingPongMode,
} from "@/game/types/pingpong";
import { PingPongGameManager } from "@/game/managers/games/pingpong/PingPongGameManager";
import { PingPongUIManager } from "@/game/managers/games/pingpong/PingPongUIManager";
import { PingPongInputManager } from "@/game/managers/games/pingpong/PingPongInputManager";
import { PingPongEffectsManager } from "@/game/managers/games/pingpong/PingPongEffectsManager";
import { PauseOverlayManager } from "@/game/managers/base";
import { submitAiGameResult } from "@/game/utils/gameResultClient";

/**
 * Real Ping Pong 게임 씬
 */
export class PingPongScene extends BaseGameScene {
  // ✅ BaseGameScene 상속
  // Managers
  private gameManager!: PingPongGameManager;
  private uiManager!: PingPongUIManager;
  private inputManager!: PingPongInputManager;
  private effectsManager!: PingPongEffectsManager;

  // Game Objects
  private playerPaddle!: PingPongPaddle;
  private aiPaddle!: PingPongPaddle;
  private ball!: PingPongBall;
  private board!: Phaser.GameObjects.Image;

  // Game State
  private gameState!: PingPongGameState;
  private inputState!: PingPongInputState;
  private escKey!: Phaser.Input.Keyboard.Key;
  private pauseButton?: Phaser.GameObjects.Text;
  private pauseOverlayManager!: PauseOverlayManager;

  // Color Selection
  private playerPaddleColorIndex: number =
    PINGPONG_CONFIG.DEFAULT_PLAYER_PADDLE_COLOR;
  private aiPaddleColorIndex: number = PINGPONG_CONFIG.DEFAULT_AI_PADDLE_COLOR;

  private readonly ASSET_PATH = "/assets/ping-pong/arts/";

  constructor() {
    super({ key: "PingPongScene" });
  }

  // ✅ BaseGameScene의 abstract 메서드 구현
  protected loadAssets(): void {
    this.load.image("pingpong_ball", `${this.ASSET_PATH}Ball.png`);
    this.load.image("pingpong_ball_motion", `${this.ASSET_PATH}BallMotion.png`);
    this.load.image("pingpong_board", `${this.ASSET_PATH}Board.png`);
    this.load.image("pingpong_player", `${this.ASSET_PATH}Player.png`);
    this.load.image("pingpong_computer", `${this.ASSET_PATH}Computer.png`);
    this.load.image("pingpong_scorebar", `${this.ASSET_PATH}ScoreBar.png`);
    this.load.image(
      "ball_blue",
      "/assets/game/kenney_puzzle-pack/png/ballBlue.png"
    );
  }

  // Phaser 생명주기: 에셋 로드
  preload(): void {
    this.loadAssets();
  }

  // 매개변수 타입을 'string'으로 지정해야 에러가 나지 않습니다.
  protected centerViewport(backgroundColor: string = "#2c2c2c"): void {
    const { width: screenWidth, height: screenHeight } = this.scale;

    // 1. 브라우저 캔버스 배경색 설정 (뷰포트 바깥 영역)
    if (this.game && this.game.canvas) {
      this.game.canvas.style.backgroundColor = backgroundColor;
    }

    // 2. Phaser 카메라 배경색 설정 (뷰포트 안쪽 영역)
    this.cameras.main.setBackgroundColor(backgroundColor);

    // 3. 카메라 월드 크기를 고정해 모든 게임 씬의 표시 영역을 일치시킴
    this.cameras.main.setSize(this.GAME_WIDTH, this.GAME_HEIGHT);

    // 4. 뷰포트 위치와 크기 설정 (중앙 정렬)
    this.cameras.main.setViewport(
      (screenWidth - this.GAME_WIDTH) / 2,
      (screenHeight - this.GAME_HEIGHT) / 2,
      this.GAME_WIDTH,
      this.GAME_HEIGHT
    );
  }

  protected setupScene(): void {
    this.centerViewport(PINGPONG_CONFIG.BACKGROUND_COLOR);
    this.initGameState();
  }

  // 게임 시작 이벤트 발생
  create(): void {
    this.setupScene();
    this.initManagers();
    this.createGameObjects();

    // ⭐ 채팅 숨김 (게임 씬이므로)
    console.log("🎮 [핑퐁] 채팅 숨김 호출");
    this.hideChat();

    this.escKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    this.onGameReady();
  }

  protected initManagers(): void {
    this.uiManager = new PingPongUIManager(this);
    this.effectsManager = new PingPongEffectsManager(this);
    this.pauseOverlayManager = new PauseOverlayManager(this);

    this.gameManager = new PingPongGameManager(this, this.gameState, {
      onScoreUpdate: (playerScore, aiScore) => {
        this.uiManager.updateScore(playerScore, aiScore);
      },
      onGameOver: (isPlayerWin) => {
        this.handleGameEnd(isPlayerWin ? "win" : "lose");
      },
      onPointScored: (scorer) => {
        this.effectsManager.createScoreEffect(
          scorer,
          this.uiManager["playerScoreText"]!,
          this.uiManager["aiScoreText"]!
        );
      },
      onNetHit: (x, y) => {
        this.effectsManager.createNetHitEffect(x, y);
      },
      onRallyUpdate: (count) => {
        this.uiManager.updateRally(count);
      },
      onPerfectHit: () => {
        this.effectsManager.createPerfectHitEffect(this.ball.x, this.ball.y);
      },
    });

    this.inputManager = new PingPongInputManager(
      this,
      this.gameState,
      this.inputState,
      {
        onColorSelect: (direction) => this.handleColorSelect(direction),
        onServeAdjust: (direction) => this.handleServeAdjust(direction),
        onServe: () => this.handleServe(),
      }
    );
  }

  protected createGameObjects(): void {
    this.createBoard();
    this.createNet();
    this.createPaddles();
    this.createBall();
    this.uiManager.createGameUI();
    this.createPauseButton();

    this.gameManager.setGameObjects(
      this.playerPaddle,
      this.aiPaddle,
      this.ball,
      this.board
    );
  }

  protected onGameReady(): void {
    this.showModeSelection();
  }

  protected handleGameEnd(result: string): void {
    const isPlayerWin = result === "win";

    // ✅ 게임 결과 가져오기
    const gameResult = this.gameManager.getGameResult();
    const isValid = this.gameManager.isValidGameResult();

    console.log("🏁 게임 종료:", gameResult);
    console.log("✅ 검증 결과:", isValid);

    // ✅ 나중에 서버로 전송할 데이터
    if (isValid) {
      void this.saveSingleGameResult(gameResult);
      console.log("📤 서버로 전송할 데이터:", gameResult);
    }

    this.uiManager.showGameOverScreen(
      isPlayerWin,
      this.gameState.playerScore,
      this.gameState.aiScore,
      () => this.restartGame(),
      () => this.goHome(),
      gameResult // ✅ 게임 결과 전달
    );

    this.inputManager.registerRestartListener(() => this.restartGame());
  }

  private async saveSingleGameResult(gameResult: {
    isWin: boolean;
    elapsedTime: number;
    playerScore: number;
  }): Promise<void> {
    try {
      await submitAiGameResult({
        gameType: "pingpong",
        userWon: gameResult.isWin,
        duration: gameResult.elapsedTime,
        points: Math.max(10, gameResult.playerScore * 5),
      });
    } catch (error) {
      console.error("[PingPong] 결과 저장 실패:", error);
    }
  }

  protected restartGame(): void {
    this.children.removeAll();
    this.gameManager.resetGame();
    this.createGameObjects();
    this.uiManager.showGameUI();
    this.gameManager.prepareServe();
  }

  private goHome(): void {
    this.scene.start("MainScene");
  }

  protected cleanupManagers(): void {
    this.hidePauseMenu();
    this.pauseOverlayManager.cleanup();
    this.inputManager.cleanup();
    this.uiManager.cleanup();
  }

  // ✅ update: 게임 로직 실행 (BaseGameScene 생명주기와 독립적)
  update(time: number, delta: number) {
    if (
      this.gameState.gameMode === "playing" &&
      Phaser.Input.Keyboard.JustDown(this.escKey)
    ) {
      this.togglePauseMenu();
      return;
    }

    if (this.pauseOverlayManager.visible()) {
      return;
    }

    this.inputManager.update();

    const moveDirection = this.inputManager.getPlayerMoveDirection();
    if (moveDirection) {
      this.gameManager.movePlayerPaddle(moveDirection, delta / 1000);
    }

    this.gameManager.update(delta / 1000);
  }

  // ============================================================
  // 게임 상태 & 이벤트
  // ============================================================

  private initGameState(): void {
    this.gameState = {
      playerScore: 0,
      aiScore: 0,
      isPlaying: false,
      isPaused: false,
      servingPlayer: "player",
      gameMode: "menu",
      isPreparingServe: false,
      // ✅ 게임 기록 초기화
      elapsedTime: 0,
      totalRallies: 0,
      currentRally: 0,
      longestRally: 0,
      perfectHits: 0,
      // ✅ 모드 초기화
      mode: PingPongMode.SINGLE, // 기본값은 싱글 모드
    };

    this.inputState = {
      upPressed: false,
      downPressed: false,
      spacePressed: false,
    };
  }

  // ============================================================
  // 모드 선택 및 게임 시작
  // ============================================================

  private showModeSelection(): void {
    this.gameState.gameMode = "menu";
    this.children.removeAll();
    this.uiManager.showModeSelection((mode) => {
      switch (mode) {
        case PingPongMode.SINGLE:
          this.startSingleGame();
          break;
        // TODO: 온라인 모드 구현 후 활성화
        // case PingPongMode.ONLINE:
        //   this.showOnlineMenu();
        //   break;
        default:
          this.exitToMainScene();
      }
    });
  }

  private startSingleGame(): void {
    this.gameState.mode = PingPongMode.SINGLE;
    this.showColorSelection();
  }

  // TODO: 온라인 모드 구현 후 활성화
  // private showOnlineMenu(): void {
  //   console.log("온라인 모드는 준비 중입니다.");
  //   this.showModeSelection();
  // }

  private exitToMainScene(): void {
    this.scene.start("MainScene");
  }

  // ============================================================
  // 게임 UI 및 입력
  // ============================================================

  private handleServe(): void {
    if (
      this.gameState.isPreparingServe &&
      this.gameState.servingPlayer === "player"
    ) {
      this.gameManager.serve();
    }
  }

  private handleColorSelect(direction: "left" | "right"): void {
    this.playerPaddleColorIndex = direction === "left" ? 0 : 1;
    this.uiManager.updateColorPreview(this.playerPaddleColorIndex);
  }

  private handleServeAdjust(direction: "up" | "down"): void {
    const adjustment = direction === "up" ? -2 : 2;
    const newY = this.ball.y + adjustment;
    this.gameManager.adjustServePosition(newY);
  }

  private showColorSelection(): void {
    this.gameState.gameMode = "colorSelect";
    this.children.removeAll();
    this.createBoard();
    this.uiManager.showColorSelection(this.playerPaddleColorIndex, () => {
      this.startGame();
    });
  }

  private startGame(): void {
    this.gameState.gameMode = "playing";
    this.aiPaddleColorIndex = this.playerPaddleColorIndex === 0 ? 1 : 0;

    console.log("🎮 [PingPong] 게임 시작!");
    console.log("📊 모드: SINGLE (AI)");
    console.log("🎨 플레이어 색상:", this.playerPaddleColorIndex);

    this.children.removeAll();
    this.createGameObjects();
    this.uiManager.showGameUI();

    this.gameManager.resetScores();
    this.gameManager.prepareServe();
  }

  private createPauseButton(): void {
    this.pauseButton?.destroy();
    const bounds = this.getViewportBounds();

    this.pauseButton = this.add
      .text(
        bounds.right - 18,
        bounds.bottom - 18,
        "⏸",
        {
          fontFamily: "Arial",
          fontSize: "36px",
          color: "#ffffff",
          backgroundColor: "#333333",
          padding: { x: 10, y: 8 },
        }
      )
      .setOrigin(1, 1)
      .setDepth(40)
      .setInteractive({ useHandCursor: true });

    this.pauseButton.on("pointerover", () => {
      this.pauseButton?.setStyle({ backgroundColor: "#555555" });
    });

    this.pauseButton.on("pointerout", () => {
      this.pauseButton?.setStyle({ backgroundColor: "#333333" });
    });

    this.pauseButton.on("pointerdown", () => {
      if (this.gameState.gameMode !== "playing") return;
      this.togglePauseMenu();
    });
  }

  private togglePauseMenu(): void {
    if (this.pauseOverlayManager.visible()) {
      this.hidePauseMenu();
    } else {
      this.showPauseMenu();
    }
  }

  private showPauseMenu(): void {
    const bounds = this.getViewportBounds();

    this.pauseOverlayManager.show(
      {
        centerX: bounds.centerX,
        centerY: bounds.centerY,
        width: bounds.width,
        height: bounds.height,
      },
      {
        onResume: () => this.hidePauseMenu(),
        onGoLobby: () => this.goHome(),
      }
    );

    this.pauseButton?.setText("▶");
  }

  private hidePauseMenu(): void {
    this.pauseOverlayManager.hide();
    this.pauseButton?.setText("⏸");
  }

  // ============================================================
  // 게임 오브젝트 생성 메서드들
  // ============================================================

  private createBoard(): void {
    const originalBoard = this.add.image(
      PINGPONG_CONFIG.GAME_WIDTH / 2,
      PINGPONG_CONFIG.GAME_HEIGHT / 2,
      "pingpong_board"
    );
    originalBoard.setVisible(false);

    const scaleX = PINGPONG_CONFIG.GAME_WIDTH / originalBoard.width;
    const scaleY =
      (PINGPONG_CONFIG.GAME_HEIGHT - PINGPONG_CONFIG.BOARD_UI_SPACE) /
      originalBoard.height;
    const scale = Math.min(scaleX, scaleY) * PINGPONG_CONFIG.BOARD_SCALE_MARGIN;

    const boardWidth = originalBoard.width * scale;
    const boardHeight = originalBoard.height * scale;
    const centerX = PINGPONG_CONFIG.GAME_WIDTH / 2;
    const centerY = PINGPONG_CONFIG.GAME_HEIGHT / 2;

    const tableGraphics = this.add.graphics();

    tableGraphics.fillStyle(0x4db396, 0.3);
    tableGraphics.fillRoundedRect(
      centerX - boardWidth / 2 + 4,
      centerY - boardHeight / 2 + 4,
      boardWidth,
      boardHeight,
      15
    );

    tableGraphics.fillStyle(PINGPONG_CONFIG.TABLE_COLOR);
    tableGraphics.fillRoundedRect(
      centerX - boardWidth / 2,
      centerY - boardHeight / 2,
      boardWidth,
      boardHeight,
      15
    );

    tableGraphics.lineStyle(3, 0xffffff, 0.9);
    tableGraphics.strokeRoundedRect(
      centerX - boardWidth / 2,
      centerY - boardHeight / 2,
      boardWidth,
      boardHeight,
      15
    );

    tableGraphics.lineStyle(3, 0xffffff, 0.6);
    const startY = centerY - boardHeight / 2 + 20;
    const endY = centerY + boardHeight / 2 - 20;

    for (let y = startY; y < endY; y += 15) {
      tableGraphics.lineBetween(centerX, y, centerX, Math.min(y + 8, endY));
    }

    tableGraphics.setDepth(-1);

    this.board = originalBoard;
    this.board.setScale(scale);
  }

  private createNet(): void {
    const boardBounds = this.board.getBounds();
    const netX = PINGPONG_CONFIG.GAME_WIDTH / 2;
    const tableY = boardBounds.centerY;
    const netHeight = PINGPONG_CONFIG.NET_HEIGHT;

    const netGraphics = this.add.graphics();
    netGraphics.fillStyle(0x666666, 1);
    netGraphics.fillRect(netX - 2, tableY - netHeight - 5, 4, netHeight + 10);
  }

  private createPaddles(): void {
    const boardBounds = this.board.getBounds();
    const paddleScale = Math.min(
      PINGPONG_CONFIG.PADDLE_SCALE,
      (boardBounds.height * PINGPONG_CONFIG.PADDLE_SIZE_RATIO) / 100
    );

    const playerX = boardBounds.left + PINGPONG_CONFIG.BOARD_PADDLE_MARGIN;
    const playerY = PINGPONG_CONFIG.GAME_HEIGHT / 2;
    const playerSprite = this.add.image(playerX, playerY, "pingpong_player");
    playerSprite.setScale(paddleScale);
    playerSprite.setTint(
      PINGPONG_CONFIG.PADDLE_COLORS[this.playerPaddleColorIndex].color
    );

    this.playerPaddle = {
      x: playerX,
      y: playerY,
      width: playerSprite.width * paddleScale,
      height: playerSprite.height * paddleScale,
      speed: PINGPONG_CONFIG.PADDLE_SPEED,
      sprite: playerSprite,
    };

    const aiX = boardBounds.right - PINGPONG_CONFIG.BOARD_PADDLE_MARGIN;
    const aiY = PINGPONG_CONFIG.GAME_HEIGHT / 2;
    const aiSprite = this.add.image(aiX, aiY, "pingpong_computer");
    aiSprite.setScale(paddleScale);
    aiSprite.setFlipX(true);
    aiSprite.setTint(
      PINGPONG_CONFIG.PADDLE_COLORS[this.aiPaddleColorIndex].color
    );

    this.aiPaddle = {
      x: aiX,
      y: aiY,
      width: aiSprite.width * paddleScale,
      height: aiSprite.height * paddleScale,
      speed: PINGPONG_CONFIG.AI_SPEED,
      sprite: aiSprite,
    };
  }

  private createBall(): void {
    const ballX = PINGPONG_CONFIG.GAME_WIDTH / 2;
    const ballY = PINGPONG_CONFIG.GAME_HEIGHT / 2;

    const ballSprite = this.add.image(ballX, ballY, "pingpong_ball");
    ballSprite.setScale(PINGPONG_CONFIG.BALL_SCALE);

    this.ball = {
      x: ballX,
      y: ballY,
      radius: (ballSprite.width * PINGPONG_CONFIG.BALL_SCALE) / 2,
      velocityX: 0,
      velocityY: 0,
      speed: PINGPONG_CONFIG.BALL_INITIAL_SPEED,
      sprite: ballSprite,
      motionSprite: undefined,
    };
  }

  // 게임 종료 이벤트 발생
  shutdown(): void {
    const endEvent = new CustomEvent("game:ended", {
      detail: { sceneName: this.scene.key },
    });
    window.dispatchEvent(endEvent);
    console.log("🛑 [핑퐁] 게임 종료 - 채팅 표시");

    super.shutdown();
  }
}
