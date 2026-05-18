import Phaser from "phaser";
import LpcCharacter from "../core/LpcCharacter";
import { LpcLoader } from "../core/LpcLoader";
import { LpcSprite } from "../utils/LpcTypes";
import { LpcSpriteManager } from "@/game/managers/global/LpcSpriteManager";

export default class CharacterScene extends Phaser.Scene {
  private character!: LpcCharacter;
  private lpcSpriteManager!: LpcSpriteManager;

  constructor() {
    super("CharacterScene");
  }

  preload() {
    this.load.json("lpc_config", "/assets/lpc_assets.json");

    this.load.on(
      Phaser.Loader.Events.FILE_COMPLETE + "-json-lpc_config",
      (key: string, type: string, data: LpcSprite) => {
        if (data && data.assets) {
          LpcLoader.loadAssets(this, data);
        }
      }
    );
  }

  create() {
    this.character = new LpcCharacter(this, 50, 100, "", this.lpcSpriteManager);
    this.character.setDefaultPart("female");
  }

  update() {
    if (this.character) {
      this.character.update();
    }
  }
}
