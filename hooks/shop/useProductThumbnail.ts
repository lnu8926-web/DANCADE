"use client";
import { useEffect, useState } from "react";

const SX = 0;
const SY = 640;
const F = 64;

// style_key → 로컬 스프라이트시트 경로
const STYLE_TO_PATH: Record<string, string> = {
  // hair (male)
  plain:            "/assets/spritesheets/head/hair/male/plain/black.png",
  mop:              "/assets/spritesheets/head/hair/male/mop/black.png",
  afro:             "/assets/spritesheets/head/hair/male/afro/black.png",
  cornrows:         "/assets/spritesheets/head/hair/male/cornrows/black.png",
  dreadlocks_short: "/assets/spritesheets/head/hair/male/dreadlocks_short/black.png",
  high_and_tight:   "/assets/spritesheets/head/hair/male/high_and_tight/black.png",
  pixie:            "/assets/spritesheets/head/hair/male/pixie/black.png",
  idol:             "/assets/spritesheets/head/hair/male/idol/black.png",
  // hair (female)
  long_straight:    "/assets/spritesheets/head/hair/female/long_straight/black.png",
  loose:            "/assets/spritesheets/head/hair/female/loose/black.png",
  bunches:          "/assets/spritesheets/head/hair/female/bunches/black.png",
  long_band:        "/assets/spritesheets/head/hair/female/long_band/black.png",
  pigtails:         "/assets/spritesheets/head/hair/female/pigtails/black.png",
  sara:             "/assets/spritesheets/head/hair/female/sara/black.png",
  wavy:             "/assets/spritesheets/head/hair/female/wavy/black.png",
  bangslong:        "/assets/spritesheets/head/hair/female/bangslong/black.png",
  // torso
  shortSleeve:        "/assets/spritesheets/body/torso/clothes/shortsleeve/base/white.png",
  shortSleeveButton:  "/assets/spritesheets/body/torso/clothes/shortsleeve/button/white.png",
  shortSleevePolo:    "/assets/spritesheets/body/torso/clothes/shortsleeve/polo/white.png",
  shortSleeveScoop:   "/assets/spritesheets/body/torso/clothes/shortsleeve/scoop/white.png",
  shortSleeveVneck:   "/assets/spritesheets/body/torso/clothes/shortsleeve/vneck/white.png",
  longSleeve:         "/assets/spritesheets/body/torso/clothes/longsleeve/base/white.png",
  longSleeveButton:   "/assets/spritesheets/body/torso/clothes/longsleeve/button/white.png",
  longSleeveCardigan: "/assets/spritesheets/body/torso/clothes/longsleeve/cardigan/white.png",
  longSleevePolo:     "/assets/spritesheets/body/torso/clothes/longsleeve/polo/white.png",
  longSleeveScoop:    "/assets/spritesheets/body/torso/clothes/longsleeve/scoop/white.png",
  longSleeveVneck:    "/assets/spritesheets/body/torso/clothes/longsleeve/vneck/white.png",
  // legs
  cuffed: "/assets/spritesheets/body/legs/cuffed/white.png",
  pants:  "/assets/spritesheets/body/legs/pants/white.png",
  formal: "/assets/spritesheets/body/legs/formal/white.png",
  // feet
  shoes: "/assets/spritesheets/body/feet/shoes/white.png",
};

const BASE_LAYERS = [
  "/assets/spritesheets/body/base/light.png",
  "/assets/spritesheets/head/base/male/light.png",
  "/assets/spritesheets/head/eyes/gray.png",
  "/assets/spritesheets/head/nose/button/light.png",
  "/assets/spritesheets/body/legs/cuffed/white.png",
  "/assets/spritesheets/body/feet/shoes/white.png",
  "/assets/spritesheets/body/torso/clothes/shortsleeve/base/white.png",
  "/assets/spritesheets/head/hair/male/plain/black.png",
];

const CATEGORY_TO_LAYER_INDEX: Record<string, number> = {
  hair:   7,
  top:    6,
  bottom: 4,
  feet:   5,
};

const cache = new Map<string, string>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function generateThumbnail(category: string, styleKey: string): Promise<string> {
  const cacheKey = `${category}:${styleKey}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const itemPath = STYLE_TO_PATH[styleKey];
  if (!itemPath) return "";

  const canvas = document.createElement("canvas");
  canvas.width = F;
  canvas.height = F;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const layers = [...BASE_LAYERS];
  const idx = CATEGORY_TO_LAYER_INDEX[category];
  if (idx !== undefined) layers[idx] = itemPath;

  for (const src of layers) {
    try {
      const img = await loadImage(src);
      ctx.drawImage(img, SX, SY, F, F, 0, 0, F, F);
    } catch {
      // 해당 레이어 스킵
    }
  }

  const dataUrl = canvas.toDataURL();
  cache.set(cacheKey, dataUrl);
  return dataUrl;
}

export function useProductThumbnail(category: string, styleKey: string | undefined) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    if (!styleKey) return;
    let cancelled = false;

    generateThumbnail(category, styleKey).then((url) => {
      if (!cancelled && url) setThumbnail(url);
    });

    return () => { cancelled = true; };
  }, [category, styleKey]);

  return thumbnail;
}
