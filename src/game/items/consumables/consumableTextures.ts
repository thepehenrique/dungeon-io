import Phaser from 'phaser';

import { CONSUMABLE_DEFINITIONS } from '../../config/consumables';

export function preloadConsumableTextures(scene: Phaser.Scene): void {
  for (const definition of Object.values(CONSUMABLE_DEFINITIONS)) {
    scene.load.image(definition.textureKey, definition.assetPath);
  }
}
