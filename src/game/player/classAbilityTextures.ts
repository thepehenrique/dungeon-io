import Phaser from 'phaser';

import {
  ARCHER_DASH_VISUAL_CONFIG,
  MAGE_PROTECTION_VISUAL_CONFIG,
} from '../config/classAbilities';

export function preloadClassAbilityTextures(scene: Phaser.Scene): void {
  scene.load.image(
    ARCHER_DASH_VISUAL_CONFIG.textureKey,
    ARCHER_DASH_VISUAL_CONFIG.assetPath,
  );
  scene.load.image(
    MAGE_PROTECTION_VISUAL_CONFIG.textureKey,
    MAGE_PROTECTION_VISUAL_CONFIG.assetPath,
  );
}
