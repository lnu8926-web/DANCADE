import Phaser from "phaser";
import LpcCharacter from "../core/LpcCharacter";
import { CharacterState, LpcSprite, PartType } from "../utils/LpcTypes";
import { LpcUtils } from "../utils/LpcUtils";
import { LpcSpriteManager } from "@/game/managers/global/LpcSpriteManager";

export default class CharacterCustomScene extends Phaser.Scene {
  private character!: LpcCharacter;
  private lpcData!: LpcSprite | null;
  private lpcSpriteManager!: LpcSpriteManager;

  constructor() {
    super("CharacterCustomScene");
  }

  init() {
    this.lpcSpriteManager = new LpcSpriteManager();
  }

  create() {
    this.character = new LpcCharacter(
      this,
      200,
      200,
      "",
      this.lpcSpriteManager
    );

    this.lpcData = this.lpcSpriteManager.getLpcSprite();

    this.cameras.main.setZoom(2.5);
    this.cameras.main.centerOn(200, 200);

    const currentData = this.registry.get("customization");
    if (currentData) {
      this.updatePlayerVisuals(currentData);
    } else if (this.lpcData) {
      this.updatePlayerVisuals(LpcUtils.getRandomState(this.lpcData));
    }

    this.registry.events.on(
      "changedata-customization",
      (parent: any, newValue: CharacterState) => {
        this.updatePlayerVisuals(newValue);
      }
    );
  }

  private updatePlayerVisuals(state: CharacterState) {
    if (!this.lpcData) return;

    const gender = state.gender;

    Object.keys(state.parts).forEach((key) => {
      const partName = key as PartType;
      const partState = state.parts[partName];
      if (!partState || !this.lpcData) return;

      const config = this.lpcData.assets[partName];
      let assetKey = "";

      if (LpcUtils.isStyledPart(config)) {
        if (partState.styleId) {
          assetKey = LpcUtils.getAssetKey(
            partName,
            partState.styleId,
            gender,
            partState.color
          );
          if (!this.textures.exists(assetKey)) {
            assetKey = LpcUtils.getAssetKey(
              partName,
              partState.styleId,
              "",
              partState.color
            );
          }
        }
      } else {
        assetKey = LpcUtils.getAssetKey(
          partName,
          null,
          gender,
          partState.color
        );

        if (!this.textures.exists(assetKey)) {
          assetKey = LpcUtils.getAssetKey(partName, null, "", partState.color);
        }
      }

      if (this.textures.exists(assetKey)) {
        this.character.setPart(partName, assetKey);
      }
    });
  }
}
