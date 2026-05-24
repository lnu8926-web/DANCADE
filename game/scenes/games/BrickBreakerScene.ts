// game/scenes/games/BrickBreakerScene.ts

import { BaseGameScene } from "@/game/scenes/base/BaseGameScene";
import { GameConfig } from "@/game/config/gameRegistry";
import {
  BrickBreakerGameManager,
  BRICK_LAYOUT,
  BRICKBREAKER_CONFIG,
} from "@/game/managers/games/brickbreaker/BrickBreakerGameManager";
import { BrickBreakerUIManager } from "@/game/managers/games/brickbreaker/BrickBreakerUIManager";
import { BrickBreakerInputManager } from "@/game/managers/games/brickbreaker/BrickBreakerInputManager";
import { BrickBreakerEffectsManager } from "@/game/managers/games/brickbreaker/BrickBreakerEffectsManager";
import { generateUUID } from "@/lib/utils/uuid";

import type {
  BrickBreakerConfig,
  BrickLayoutConfig,
} from "@/game/managers/games/brickbreaker/BrickBreakerGameManager";

export class BrickBreakerScene extends BaseGameScene {
  private sessionId: string = "";

  // Managers
  private gameManager!: BrickBreakerGameManager;
  private uiManager!: BrickBreakerUIManager;
  private inputManager!: BrickBreakerInputManager;
  private effectsManager!: BrickBreakerEffectsManager;

  // Game Objects
  private paddle!: Phaser.Physics.Arcade.Sprite;
  private ball!: Phaser.Physics.Arcade.Sprite;
  private bricks!: Phaser.Physics.Arcade.StaticGroup;

  // Game Meta
  private gameConfig?: GameConfig;

  private readonly GAME_CONFIG: BrickBreakerConfig = BRICKBREAKER_CONFIG;
  private readonly BRICK_LAYOUT: BrickLayoutConfig = BRICK_LAYOUT;

  private readonly BRICK_COLORS = [
    "element_red_rectangle_glossy",
    "element_yellow_rectangle_glossy",
    "element_green_rectangle_glossy",
    "element_blue_rectangle_glossy",
    "element_purple_rectangle_glossy",
  ];

  private readonly ASSET_PATH = "/assets/game/kenney_puzzle-pack/png/";

  // 스페이스바 키
  private spaceKey!: Phaser.Input.Keyboard.Key;
  // ESC 키 (일시정지)
  private escKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "BrickBreakerScene" });
  }

  init(data: { gameConfig?: GameConfig }) {
    this.gameConfig = data.gameConfig;
    // 중복 제출 방지용 sessionId 생성
    this.sessionId = generateUUID();
  }

  // Phaser 생명주기: 에셋 로드
  preload(): void {
    this.loadAssets();
  }

  // 1. 에셋 로드
  protected loadAssets(): void {
    this.load.image("paddle", `${this.ASSET_PATH}paddleBlu.png`);
    this.load.image("ball", `${this.ASSET_PATH}ballBlue.png`);
    this.load.image("buttonDefault", `${this.ASSET_PATH}buttonDefault.png`);
    this.load.image("buttonSelected", `${this.ASSET_PATH}buttonSelected.png`);

    this.BRICK_COLORS.forEach((color) => {
      this.load.image(color, `${this.ASSET_PATH}${color}.png`);
    });
  }

  protected centerViewport(backgroundColor: string = "#000000"): void {
    const { width: screenWidth, height: screenHeight } = this.scale;

    // 1. 캔버스 자체 스타일 수정 (뷰포트 바깥 영역)
    if (this.game && this.game.canvas) {
      this.game.canvas.style.backgroundColor = backgroundColor;
    }

    // 2. 카메라 배경색 설정
    this.cameras.main.setBackgroundColor(backgroundColor);

    // 3. 뷰포트 설정 (중앙 정렬)
    this.cameras.main.setViewport(
      (screenWidth - this.GAME_WIDTH) / 2,
      (screenHeight - this.GAME_HEIGHT) / 2,
      this.GAME_WIDTH,
      this.GAME_HEIGHT
    );
  }

  // 2. 씬 기본 설정
  protected setupScene(): void {
    this.centerViewport("#000000");

    // 뷰포트 안쪽은 이제 무조건 800x600
    this.physics.world.setBounds(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);

    // 배경 이미지
    const background = this.add.image(400, 300, "game_background");
    background.setDisplaySize(this.GAME_WIDTH, this.GAME_HEIGHT);
    background.setDepth(-1);

    // 핑크색 테두리 (가이드라인)
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xff006e, 1);
    graphics.strokeRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
  }

  // 게임 시작 이벤트 발생
  create(): void {
    this.setupScene();
    this.initManagers();
    this.createGameObjects();

    // ⭐ 채팅 숨김 (게임 씬이므로)
    console.log("🎮 [벽돌깨기] 채팅 숨김 호출");
    this.hideChat();

    this.onGameReady();
  }

  // 3. 매니저 초기화
  protected initManagers(): void {
    this.uiManager = new BrickBreakerUIManager(this);
    this.effectsManager = new BrickBreakerEffectsManager(this);
    this.inputManager = new BrickBreakerInputManager(this);

    this.gameManager = new BrickBreakerGameManager(
      this,
      this.GAME_CONFIG,
      this.BRICK_LAYOUT,
      {
        onScoreUpdate: (score) => {
          this.uiManager.updateScore(score);
        },
        onLivesUpdate: (lives) => {
          this.uiManager.updateLives(lives);
        },
        onGameResult: (result) => {
          this.handleGameEnd(result);
        },
        onBrickDestroy: (x: number, y: number, brickColor: string) => {
          // ✅ 벽돌 파괴 시 파티클 효과
          this.effectsManager.createBrickDestroyEffect(x, y, brickColor);
        },
        onGamePause: () => {
          // 일시정지 UI 표시 (isPaused = true)
          this.uiManager.togglePauseScreen(true);
        },
        onGameResume: () => {
          // 일시정지 UI 숨김 (isPaused = false)
          this.uiManager.togglePauseScreen(false);
        },
        onBricksDescend: () => {
          // ✅ 벽돌 하강 처리
          this.descendBricks();
        },
      }
    );
  }

  // 4. 게임 오브젝트 생성
  protected createGameObjects(): void {
    this.createPaddle();
    this.createBall();
    this.createBricks();
    this.uiManager.createGameUI();

    // ✅ 일시정지 버튼 콜백 설정
    this.uiManager.setPauseToggleCallback(() => {
      this.gameManager.togglePause();
    });

    this.gameManager.setGameObjects(this.paddle, this.ball, this.bricks);
    this.setupCollisions();

    // ✅ 스페이스바 키 등록
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // ✅ ESC 키 등록 (일시정지)
    this.escKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    // ✅ 추가: "PRESS SPACE TO START" 텍스트
    const startText = this.add
      .text(400, 350, "PRESS SPACE TO START", {
        fontFamily: '"Press Start 2P"',
        fontSize: "18px",
        color: "#1af9d9",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(10);

    // 깜빡이는 애니메이션
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // 볼 발사 시 제거
    this.spaceKey.on("down", () => {
      startText.destroy();
    });
  }

  // 5. 게임 종료 및 재시작 로직
  protected async handleGameEnd(result: string): Promise<void> {
    // ✅ 게임 종료 시 서버로 전송
    const gameData = this.gameManager.getGameResult();

    // 📊 게임 결과 상세 콘솔 출력
    console.group("🎮 BrickBreaker 게임 종료");
    console.log("게임 결과:", result === "win" ? "승리 ✅" : "패배 ❌");
    console.log("점수:", gameData.score);
    console.log("경과 시간:", `${gameData.elapsedTime}초`);
    console.log("파괴된 벽돌:", `${gameData.bricksDestroyed}개`);
    console.log("남은 라이프:", gameData.lives);
    console.log("전체 데이터:", gameData);
    console.groupEnd();

    // 서버로 전송
    await this.sendToServer(gameData);

    this.uiManager.showEndGameScreen(
      result as "win" | "gameOver",
      this.gameManager.getScore(),
      () => this.restartGame(),
      () => this.goHome()
    );
  }

  protected restartGame(): void {
    this.scene.restart();
  }

  private goHome(): void {
    this.scene.start("MainScene");
  }

  private async sendToServer(
    data: ReturnType<typeof this.gameManager.getGameResult>
  ): Promise<void> {
    try {
      console.log("📤 서버로 게임 결과 전송 중...");

      // localStorage에서 사용자 정보 가져오기
      const userDataStr = localStorage.getItem("user");
      let userId: string | null = null;

      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          userId = userData.userId || userData.id;
        } catch (e) {
          console.warn("localStorage 파싱 실패:", e);
        }
      }

      if (!userId) {
        console.warn("⚠️ 사용자 ID를 찾을 수 없습니다");
        return;
      }

      const response = await fetch("/api/games/brick-breaker/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId, // ✅ userId 추가
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const result = await response.json();
      console.group("✅ 서버 응답 성공");
      console.log("응답 데이터:", result);
      console.groupEnd();
    } catch (error) {
      console.group("❌ 서버 전송 실패");
      console.error("오류 내용:", error);
      console.groupEnd();
      // 서버 전송 실패해도 게임 진행은 계속됨
    }
  }

  protected cleanupManagers(): void {
    this.physics.world.off("worldbounds");
    this.inputManager.cleanup();
    this.uiManager.cleanup();
  }

  update(time: number, delta: number): void {
    // 일시정지 상태 확인
    const isPaused = this.gameManager.isPaused();

    // ESC 키는 항상 받음 (일시정지 토글용)
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.gameManager.togglePause();
    }

    // 일시정지 중이면 다른 입력 무시
    if (isPaused) {
      return;
    }

    // ✅ 패들 이동 입력
    const direction = this.inputManager.getPaddleMoveDirection();
    this.gameManager.movePaddle(direction);

    // ✅ 스페이스바 눌렀을 때 공 발사
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.gameManager.launchBall();
    }

    // ✅ GameManager update 호출 (공이 패들 위에 고정되어 있을 때 처리)
    this.gameManager.update(delta);
  }

  // ============================================================
  // 게임 오브젝트 생성 메서드들
  // ============================================================

  private createPaddle(): void {
    const paddleX = this.GAME_CONFIG.width / 2;
    const paddleY = 550;

    this.paddle = this.physics.add.sprite(paddleX, paddleY, "paddle");
    this.paddle.setScale(1.2).setImmovable(true).setCollideWorldBounds(true);
  }

  private createBall(): void {
    const ballX = this.GAME_CONFIG.width / 2;
    const ballY = 500;

    this.ball = this.physics.add.sprite(ballX, ballY, "ball");
    this.ball.setCollideWorldBounds(true).setBounce(1);
    // ✅ 초기 속도는 설정하지 않음 (launchBall()에서 설정)
    this.ball.setVelocity(0, 0);

    if (this.ball.body) {
      (this.ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    }
  }

  private createBricks(): void {
    this.bricks = this.physics.add.staticGroup();

    const { cols, width, spacing, startY, height } = this.BRICK_LAYOUT;
    const totalWidth = cols * width + (cols - 1) * spacing;
    const startX = (this.GAME_WIDTH - totalWidth) / 2 + width / 2;

    for (let row = 0; row < this.BRICK_LAYOUT.rows; row++) {
      for (let col = 0; col < cols; col++) {
        const brickX = startX + col * (width + spacing);
        const brickY = startY + row * height;
        const brickColor = this.BRICK_COLORS[row % this.BRICK_COLORS.length];

        this.bricks.create(brickX, brickY, brickColor);
      }
    }
  }

  // 벽돌 하강 처리
  private descendBricks(): void {
    const { height } = this.BRICK_LAYOUT;
    const paddleY = this.paddle.y - this.paddle.displayHeight / 2;
    let gameOver = false;

    // 모든 벽돌을 한 줄씩 아래로 이동
    this.bricks.getChildren().forEach((brick) => {
      const brickSprite = brick as Phaser.Physics.Arcade.Sprite;
      const newY = brickSprite.y + height;

      // 벽돌이 패들 높이에 도달하면 게임 오버
      if (newY >= paddleY - 20) {
        gameOver = true;
      }

      brickSprite.setY(newY);
      brickSprite.refreshBody(); // StaticGroup이므로 body 갱신 필요
    });

    if (gameOver) {
      this.gameManager.handleBrickReachedBottom();
      return;
    }

    // 새로운 벽돌 행 추가
    this.addNewBrickRow();
  }

  // 새로운 벽돌 행 추가
  private addNewBrickRow(): void {
    const { cols, width, spacing, startY } = this.BRICK_LAYOUT;
    const totalWidth = cols * width + (cols - 1) * spacing;
    const startX = (this.GAME_WIDTH - totalWidth) / 2 + width / 2;

    // 랜덤 색상 선택
    const randomColorIndex = Phaser.Math.Between(
      0,
      this.BRICK_COLORS.length - 1
    );
    const brickColor = this.BRICK_COLORS[randomColorIndex];

    for (let col = 0; col < cols; col++) {
      const brickX = startX + col * (width + spacing);
      const brickY = startY;

      const newBrick = this.bricks.create(brickX, brickY, brickColor);

      // 새 벽돌 등장 애니메이션
      newBrick.setAlpha(0);
      this.tweens.add({
        targets: newBrick,
        alpha: 1,
        duration: 300,
        ease: "Power2",
      });
    }
  }

  private setupCollisions(): void {
    // 1. 패들 충돌
    this.physics.add.collider(this.ball, this.paddle, (ball, paddle) => {
      this.gameManager.handlePaddleCollision(
        ball as Phaser.Types.Physics.Arcade.GameObjectWithBody,
        paddle as Phaser.Types.Physics.Arcade.GameObjectWithBody
      );
    });

    // 2. 벽돌 충돌
    this.physics.add.collider(this.ball, this.bricks, (ball, brick) => {
      this.gameManager.handleBrickCollision(
        ball as Phaser.Types.Physics.Arcade.GameObjectWithBody,
        brick as Phaser.Types.Physics.Arcade.GameObjectWithBody
      );
    });

    // 3. 바닥 충돌 (월드 경계)
    this.physics.world.on("worldbounds", (body: Phaser.Physics.Arcade.Body) => {
      if (body.gameObject === this.ball && body.blocked.down) {
        this.gameManager.handleFloorCollision();
      }
    });
  }

  // 게임 종료 이벤트 발생
  shutdown(): void {
    const endEvent = new CustomEvent("game:ended", {
      detail: { sceneName: this.scene.key },
    });
    window.dispatchEvent(endEvent);
    console.log("🛑 [벽돌깨기] 게임 종료 - 채팅 표시");

    super.shutdown();
  }
}
