export interface PauseMenuBounds {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface PauseMenuCallbacks {
  onResume: () => void;
  onGoLobby: () => void;
}

interface PauseOverlayOptions {
  title?: string;
  resumeLabel?: string;
  lobbyLabel?: string;
  hintLines?: string[];
  hintLine1?: string;
  hintLine2?: string;
}

const DEFAULT_OPTIONS: Required<PauseOverlayOptions> = {
  title: "PAUSED",
  resumeLabel: "CONTINUE",
  lobbyLabel: "LOBBY",
  hintLines: [],
  hintLine1: "CONTINUE를 누르면 바로 이어서 플레이할 수 있어요.",
  hintLine2: "LOBBY를 누르면 메인 메뉴로 돌아가요.",
};

export class PauseOverlayManager {
  private scene: Phaser.Scene;
  private options: Required<PauseOverlayOptions>;

  private overlay?: Phaser.GameObjects.Rectangle;
  private titleText?: Phaser.GameObjects.Text;
  private hintTexts: Phaser.GameObjects.Text[] = [];
  private actionButtons: Phaser.GameObjects.Text[] = [];

  private isOpen: boolean = false;

  constructor(scene: Phaser.Scene, options: PauseOverlayOptions = {}) {
    this.scene = scene;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      hintLines:
        options.hintLines && options.hintLines.length > 0
          ? options.hintLines
          : [options.hintLine1 ?? DEFAULT_OPTIONS.hintLine1, options.hintLine2 ?? DEFAULT_OPTIONS.hintLine2],
    };
  }

  show(bounds: PauseMenuBounds, callbacks: PauseMenuCallbacks): void {
    if (this.isOpen) return;

    this.overlay = this.scene.add
      .rectangle(
        bounds.centerX,
        bounds.centerY,
        bounds.width,
        bounds.height,
        0x000000,
        0.75
      )
      .setDepth(30);

    this.titleText = this.scene.add
      .text(bounds.centerX, bounds.centerY - 80, this.options.title, {
        fontFamily: '"Press Start 2P"',
        fontSize: "40px",
        color: "#f1c40f",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(31);

    this.hintTexts = this.options.hintLines
      .filter((line) => line.trim().length > 0)
      .map((line, index) =>
        this.scene.add
          .text(bounds.centerX, bounds.centerY + 8 + index * 28, line, {
            fontFamily: "Arial",
            fontSize: index === 0 ? "18px" : "16px",
            color: index === 0 ? "#ffffff" : "#bdc3c7",
            align: "center",
          })
          .setOrigin(0.5)
          .setDepth(31)
      );

    const continueButton = this.scene.add
      .text(bounds.centerX, bounds.centerY + 95, this.options.resumeLabel, {
        fontFamily: '"Press Start 2P"',
        fontSize: "18px",
        color: "#2ecc71",
        backgroundColor: "#1f2a1f",
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(32)
      .setInteractive({ useHandCursor: true });

    const lobbyButton = this.scene.add
      .text(bounds.centerX, bounds.centerY + 140, this.options.lobbyLabel, {
        fontFamily: '"Press Start 2P"',
        fontSize: "18px",
        color: "#f1c40f",
        backgroundColor: "#2c2412",
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(32)
      .setInteractive({ useHandCursor: true });

    continueButton.on("pointerdown", () => {
      callbacks.onResume();
    });

    lobbyButton.on("pointerdown", () => {
      callbacks.onGoLobby();
    });

    this.actionButtons = [continueButton, lobbyButton];
    this.isOpen = true;
  }

  hide(): void {
    this.overlay?.destroy();
    this.titleText?.destroy();

    this.hintTexts.forEach((text) => text.destroy());
    this.actionButtons.forEach((button) => button.destroy());

    this.hintTexts = [];
    this.actionButtons = [];
    this.overlay = undefined;
    this.titleText = undefined;
    this.isOpen = false;
  }

  visible(): boolean {
    return this.isOpen;
  }

  cleanup(): void {
    this.hide();
  }
}
