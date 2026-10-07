import Phaser from 'phaser';

import { CHEST_DEFINITIONS } from '../../config/chests';
import { ItemRarity } from '../../types/item';

const CHEST_SPRITESHEET_PATH =
  'assets/dungeon/doors_lever_chest_animation.png';
const CHEST_FRAME_WIDTH = 32;
const CHEST_FRAME_HEIGHT = 22;
const CHEST_FRAME_X = 128;
const CHEST_FRAME_Y = 16;
const CHEST_STATE_SPACING_Y = 48;
const COMMON_CHEST_OPEN_FRAMES = [0, 1, 2, 3, 4].map(
  (state) => `front-${state}`,
);

export function preloadChestSprites(scene: Phaser.Scene): void {
  const definition = CHEST_DEFINITIONS[ItemRarity.Common];

  if (!definition) {
    throw new Error('Common chest definition is missing.');
  }

  scene.load.image(definition.textureKey, CHEST_SPRITESHEET_PATH);
}

export function createChestAnimations(scene: Phaser.Scene): void {
  const definition = CHEST_DEFINITIONS[ItemRarity.Common];

  if (!definition) {
    throw new Error('Common chest definition is missing.');
  }

  const texture = scene.textures.get(definition.textureKey);

  for (const [state, frameName] of COMMON_CHEST_OPEN_FRAMES.entries()) {
    if (!texture.has(frameName)) {
      texture.add(
        frameName,
        0,
        CHEST_FRAME_X,
        CHEST_FRAME_Y + state * CHEST_STATE_SPACING_Y,
        CHEST_FRAME_WIDTH,
        CHEST_FRAME_HEIGHT,
      );
    }
  }

  if (scene.anims.exists(definition.openAnimationKey)) {
    return;
  }

  scene.anims.create({
    key: definition.openAnimationKey,
    frames: COMMON_CHEST_OPEN_FRAMES.map((frame) => ({
      key: definition.textureKey,
      frame,
    })),
    frameRate: 8,
    repeat: 0,
  });
}
