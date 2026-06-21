const B = process.env.NEXT_PUBLIC_ASSET_URL ?? "";

export const ASSET_PATHS = {
  GAME: {
    BACKGROUND: `${B}/assets/background/bg 1.png`,
    KENNEY_PUZZLE: `${B}/assets/game/kenney_puzzle-pack/png/`,
  },
  PINGPONG: `${B}/assets/ping-pong/arts/`,
  TILESETS: {
    BASE: `${B}/tilesets/`,
    COMMON_TILE: `${B}/tilesets/CommonTile.png`,
    PLANTS: `${B}/tilesets/Plants.png`,
    ARCADE1: `${B}/tilesets/arcade1.png`,
    ARCADE2: `${B}/tilesets/arcade2.png`,
    BLUE_CHAIR: `${B}/tilesets/BlueChair.png`,
    BUTTON: `${B}/tilesets/button.png`,
    BUTTON2: `${B}/tilesets/button2.png`,
    DESK1: `${B}/tilesets/desk1.png`,
    DESK2: `${B}/tilesets/desk2.png`,
    ELECTRONIC: `${B}/tilesets/electronic.png`,
    MAIN_DESK: `${B}/tilesets/mainDesk.png`,
    RED_CHAIR: `${B}/tilesets/RedChair.png`,
    STOREFRONT_SIGN: `${B}/tilesets/storefrontSign.png`,
    BG1_1: `${B}/tilesets/bg1_1.png`,
  },
  MAPS: {
    ARCADE: `${B}/maps/DanArcadeLast9.tmj`,
  },
  LPC: {
    CONFIG: `${B}/assets/lpc_assets.json`,
    SPRITESHEETS: {
      BODY: `${B}/assets/spritesheets/body/teen/`,
      HEAD: `${B}/assets/spritesheets/head/heads/human/`,
      EYES: `${B}/assets/spritesheets/eyes/human/adult/`,
      NOSE: `${B}/assets/spritesheets/nose/button/adult/`,
      HAIR: `${B}/assets/spritesheets/hair/`,
      TORSO: `${B}/assets/spritesheets/torso/clothes/`,
      LEGS: `${B}/assets/spritesheets/legs/`,
      FEET: `${B}/assets/spritesheets/feet/`,
    },
  },
};
