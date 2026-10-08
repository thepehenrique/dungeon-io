import Phaser from 'phaser';

import {
  ARROW_CONFIG,
  FIREBALL_ANIMATION_KEY,
  FIREBALL_CONFIG,
} from '../config/weapons';

const ARROW_ASSET_PATH = 'assets/projectiles/archer-arrow.png';
const ARROW_FRAME = {
  name: 'arrow-default',
  x: 250,
  y: 285,
  width: 1510,
  height: 260,
} as const;
const FIREBALL_ASSET_PATH = 'assets/projectiles/fireball-eight-frame.png';
const FIREBALL_FRAME_WIDTH = 313;
const FIREBALL_FRAME_HEIGHT = 280;
const FIREBALL_FRAME_COLUMNS = [0, 313, 627, 941] as const;
const FIREBALL_FRAME_ROWS = [350, 630] as const;

export function preloadProjectileTextures(scene: Phaser.Scene): void {
  scene.load.image(ARROW_CONFIG.textureKey, ARROW_ASSET_PATH);
  scene.load.image(FIREBALL_CONFIG.textureKey, FIREBALL_ASSET_PATH);
}

export function createProjectileTextures(scene: Phaser.Scene): void {
  createArrowTexture(scene);
  createFireballAnimation(scene);
}

function createArrowTexture(scene: Phaser.Scene): void {
  if (!scene.textures.exists(ARROW_CONFIG.textureKey)) {
    return;
  }

  const texture = scene.textures.get(ARROW_CONFIG.textureKey);

  if (!texture.has(ARROW_FRAME.name)) {
    texture.add(
      ARROW_FRAME.name,
      0,
      ARROW_FRAME.x,
      ARROW_FRAME.y,
      ARROW_FRAME.width,
      ARROW_FRAME.height,
    );
  }
}

function createFireballAnimation(scene: Phaser.Scene): void {
  if (!scene.textures.exists(FIREBALL_CONFIG.textureKey)) {
    return;
  }

  const texture = scene.textures.get(FIREBALL_CONFIG.textureKey);
  const frameNames: string[] = [];

  for (const y of FIREBALL_FRAME_ROWS) {
    for (const x of FIREBALL_FRAME_COLUMNS) {
      const frameName = `fireball-${frameNames.length}`;
      frameNames.push(frameName);

      if (!texture.has(frameName)) {
        texture.add(
          frameName,
          0,
          x,
          y,
          FIREBALL_FRAME_WIDTH,
          FIREBALL_FRAME_HEIGHT,
        );
      }
    }
  }

  if (!scene.anims.exists(FIREBALL_ANIMATION_KEY)) {
    scene.anims.create({
      key: FIREBALL_ANIMATION_KEY,
      frames: frameNames.map((frame) => ({
        key: FIREBALL_CONFIG.textureKey,
        frame,
      })),
      frameRate: 12,
      repeat: -1,
    });
  }
}
