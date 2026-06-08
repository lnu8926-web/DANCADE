import { ButtonFactory } from "@/game/utils/ButtonFactory";

export type EndGameAnimation =
  | { type: "scale"; value: number; duration: number }
  | { type: "alpha"; value: number; duration: number };

export interface BaseEndGameUIOptions {
  title: string;
  titleColor: string;
  onRestart: () => void;
  onHome: () => void;
  overlayAlpha?: number;
  depth?: number;
  titleY?: number;
  restartY?: number;
  homeY?: number;
  restartLabel?: string;
  homeLabel?: string;
  animation?: EndGameAnimation;
  renderContent?: (context: {
    scene: Phaser.Scene;
    depth: number;
    centerX: number;
    centerY: number;
  }) => Phaser.GameObjects.GameObject[];
}

export class BaseEndGameUI {
  private scene: Phaser.Scene;
  private root?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(options: BaseEndGameUIOptions): void {
    this.cleanup();

    const {
      title,
      titleColor,
      onRestart,
      onHome,
      overlayAlpha = 0.7,
      depth = 10,
      titleY = 200,
      restartY = 420,
      homeY = 500,
      restartLabel = "RESTART",
      homeLabel = "HOME",
      animation,
      renderContent,
    } = options;

    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    this.root = this.scene.add.container(0, 0);

    const overlay = this.scene.add
      .rectangle(centerX, centerY, this.scene.scale.width, this.scene.scale.height, 0x000000, overlayAlpha)
      .setDepth(depth);

    const titleText = this.scene.add
      .text(centerX, titleY, title, {
        fontFamily: '"NeoDunggeunmo", Arial',
        fontSize: "64px",
        color: titleColor,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(depth + 1);

    if (animation?.type === "scale") {
      this.scene.tweens.add({
        targets: titleText,
        scale: animation.value,
        duration: animation.duration,
        yoyo: true,
        repeat: -1,
      });
    }

    if (animation?.type === "alpha") {
      this.scene.tweens.add({
        targets: titleText,
        alpha: animation.value,
        duration: animation.duration,
        yoyo: true,
        repeat: -1,
      });
    }

    const restartButton = ButtonFactory.createButton(
      this.scene,
      centerX,
      restartY,
      restartLabel,
      () => {
        this.cleanup();
        onRestart();
      },
      {
        size: "SMALL",
        color: 0x000000,
        textColor: "#ffffff",
        fontFamily: '"Press Start 2P"',
        fontSize: "14px",
      }
    ).setDepth(depth + 1);

    const homeButton = ButtonFactory.createButton(
      this.scene,
      centerX,
      homeY,
      homeLabel,
      () => {
        this.cleanup();
        onHome();
      },
      {
        size: "SMALL",
        color: 0x000000,
        textColor: "#ffffff",
        fontFamily: '"Press Start 2P"',
        fontSize: "14px",
      }
    ).setDepth(depth + 1);

    const extras = renderContent
      ? renderContent({
          scene: this.scene,
          depth: depth + 1,
          centerX,
          centerY,
        })
      : [];

    this.root.add([overlay, titleText, ...extras, restartButton, homeButton]);
  }

  cleanup(): void {
    this.root?.destroy(true);
    this.root = undefined;
  }
}
