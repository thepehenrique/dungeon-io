import Phaser from 'phaser';

import { CONSUMABLE_DEFINITIONS } from '../../config/consumables';
import { ConsumableType } from '../../types/consumable';

export function createConsumablePlaceholderTextures(scene: Phaser.Scene): void {
  createPotionTexture(
    scene,
    CONSUMABLE_DEFINITIONS[ConsumableType.MinorHealthPotion].textureKey,
    28,
    34,
    0x70dc91,
  );
  createPotionTexture(
    scene,
    CONSUMABLE_DEFINITIONS[ConsumableType.MajorHealthPotion].textureKey,
    38,
    46,
    0xef657a,
  );
}

function createPotionTexture(
  scene: Phaser.Scene,
  textureKey: string,
  width: number,
  height: number,
  liquidColor: number,
): void {
  if (scene.textures.exists(textureKey)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  const centerX = width / 2;
  const neckWidth = Math.max(8, Math.round(width * 0.3));
  const bottleTop = Math.round(height * 0.2);
  const bottleBottom = height - 2;

  graphics.fillStyle(0x8a5b32, 1);
  graphics.fillRoundedRect(centerX - neckWidth / 2, 1, neckWidth, 8, 2);
  graphics.fillStyle(0xd8edf0, 0.95);
  graphics.fillRoundedRect(2, bottleTop, width - 4, bottleBottom - bottleTop, 7);
  graphics.fillStyle(liquidColor, 1);
  graphics.fillRoundedRect(5, Math.round(height * 0.48), width - 10, height * 0.4, 5);
  graphics.lineStyle(2, 0xf4fbff, 0.9);
  graphics.strokeRoundedRect(2, bottleTop, width - 4, bottleBottom - bottleTop, 7);
  graphics.fillStyle(0xffffff, 0.7);
  graphics.fillCircle(Math.round(width * 0.35), Math.round(height * 0.42), 2);
  graphics.generateTexture(textureKey, width, height);
  graphics.destroy();
}
