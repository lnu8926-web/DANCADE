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
  hintLine1?: string;
  hintLine2?: string;
}

const DEFAULT_OPTIONS: Required<PauseOverlayOptions> = {
  title: "PAUSED",
  resumeLabel: "CONTINUE",
  lobbyLabel: "LOBBY",
  hintLine1: "ESC or CONTINUE: Resume",
  hintLine2: "LOBBY: Return to MainScene",
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
    this.options = { ...DEFAULT_OPTIONS, ...options };
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
        fontSize: "48px",
        color: "#f1c40f",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(31);

    const hint1 = this.scene.add
      .text(bounds.centerX, bounds.centerY + 10, this.options.hintLine1, {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(31);

    const hint2 = this.scene.add
      .text(bounds.centerX, bounds.centerY + 40, this.options.hintLine2, {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#bdc3c7",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(31);

    this.hintTexts = [hint1, hint2];

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
