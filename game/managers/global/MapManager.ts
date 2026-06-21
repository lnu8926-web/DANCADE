import * as Phaser from "phaser";
import { ASSET_PATHS } from "@/game/constants";

const TILE_IMAGES: Array<[string, string]> = [
  ["CommonTile", ASSET_PATHS.TILESETS.COMMON_TILE],
  ["Plants", ASSET_PATHS.TILESETS.PLANTS],
  ["arcade1", ASSET_PATHS.TILESETS.ARCADE1],
  ["arcade2", ASSET_PATHS.TILESETS.ARCADE2],
  ["BlueChair", ASSET_PATHS.TILESETS.BLUE_CHAIR],
  ["button", ASSET_PATHS.TILESETS.BUTTON],
  ["button2", ASSET_PATHS.TILESETS.BUTTON2],
  ["desk1", ASSET_PATHS.TILESETS.DESK1],
  ["desk2", ASSET_PATHS.TILESETS.DESK2],
  ["electronic", ASSET_PATHS.TILESETS.ELECTRONIC],
  ["mainDesk", ASSET_PATHS.TILESETS.MAIN_DESK],
  ["RedChair", ASSET_PATHS.TILESETS.RED_CHAIR],
  ["storefrontSign", ASSET_PATHS.TILESETS.STOREFRONT_SIGN],
];
const MAIN_MAP = ASSET_PATHS.MAPS.ARCADE;

export class MapManager {
  //MapManager의 인스턴스는 Scene의 종속된다.
  private scene: Phaser.Scene;
  private map!: Phaser.Tilemaps.Tilemap;

  private wallsLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private object1Layer: Phaser.Tilemaps.TilemapLayer | null = null;
  private object2Layer: Phaser.Tilemaps.TilemapLayer | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  private loadImages(images: [string, string][]) {
    images.forEach(([key, path]) => this.scene.load.image(key, path));
  }

  public preloadMap() {
    //어느 씬에서 에셋을 등록하건 BaseCache에 저장되고 CacheManager 가 관리한다.
    this.loadImages(TILE_IMAGES);
    this.scene.load.tilemapTiledJSON("map", MAIN_MAP);
    this.scene.load.image("bg1_1", ASSET_PATHS.TILESETS.BG1_1);
  }

  public createMap() {
    this.map = this.scene.make.tilemap({ key: "map" }); // this.scene.load.tilemapTiledJSON("map", MAIN_MAP) 에서 등록한 key로 CacheManager에게 등록한 MAIN_MAP 요청
    this.scene.add.image(0, 0, "bg1_1").setOrigin(0, 0).setDepth(-1);

    const tilesetsRaw = TILE_IMAGES.map(([key]) => {
      return this.map!.addTilesetImage(key, key);
    });
    const tilesets = tilesetsRaw.filter(
      (ts): ts is Phaser.Tilemaps.Tileset => ts !== null
    );

    if (!tilesets.length) return;

    this.map!.createLayer("ground", tilesets, 0, 0);
    this.wallsLayer = this.map!.createLayer("walls", tilesets, 0, 0);
    this.object1Layer = this.map!.createLayer("object1", tilesets, 0, 0);
    this.object2Layer = this.map!.createLayer("object2", tilesets, 0, 0);
    this.scene.cameras.main.setBounds(
      0,
      0,
      this.map!.widthInPixels,
      this.map!.heightInPixels
    );
  }

  public setupCollisions(avatar: Phaser.GameObjects.GameObject): void {
    this.addTilemapCollision(avatar, this.wallsLayer);
    this.addTilemapCollision(avatar, this.object1Layer);
    this.addTilemapCollision(avatar, this.object2Layer);
  }

  private addTilemapCollision(
    avatar: Phaser.GameObjects.GameObject,
    layer?: Phaser.Tilemaps.TilemapLayer | null
  ) {
    if (!layer) return;
    layer.setCollisionByProperty({ collides: true });
    this.scene.physics.add.collider(avatar, layer);
  }

  public getMap(): Phaser.Tilemaps.Tilemap | undefined {
    return this.map;
  }
}
