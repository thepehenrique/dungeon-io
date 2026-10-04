import Phaser from 'phaser';

import { CHEST_DEFINITIONS } from '../../config/chests';
import { Rarity } from '../../types/loot';

export function createChestPlaceholderTextures(scene: Phaser.Scene): void {
  const definition = CHEST_DEFINITIONS[Rarity.Common];

  if (!definition) {
    throw new Error('Common chest definition is missing.');
  }

  if (!scene.textures.exists(definition.closedTextureKey)) {
    const closedGraphics = scene.make.graphics({ x: 0, y: 0 }, false);
    closedGraphics.fillStyle(0x3b2618, 1);
    closedGraphics.fillRoundedRect(2, 12, 52, 34, 5);
    closedGraphics.fillStyle(0x79512d, 1);
    closedGraphics.fillRoundedRect(2, 5, 52, 20, 7);
    closedGraphics.lineStyle(4, 0xb68a49, 1);
    closedGraphics.strokeRoundedRect(2, 5, 52, 41, 6);
    closedGraphics.fillStyle(0xd6ab5f, 1);
    closedGraphics.fillRect(24, 19, 8, 13);
    closedGraphics.generateTexture(definition.closedTextureKey, 56, 48);
    closedGraphics.destroy();
  }

  if (!scene.textures.exists(definition.openTextureKey)) {
    const openGraphics = scene.make.graphics({ x: 0, y: 0 }, false);
    openGraphics.fillStyle(0x3b2618, 1);
    openGraphics.fillRoundedRect(2, 22, 52, 24, 5);
    openGraphics.fillStyle(0xd6b764, 0.3);
    openGraphics.fillTriangle(8, 22, 48, 22, 28, 1);
    openGraphics.lineStyle(4, 0xb68a49, 1);
    openGraphics.strokeRoundedRect(2, 22, 52, 24, 5);
    openGraphics.generateTexture(definition.openTextureKey, 56, 48);
    openGraphics.destroy();
  }
}
