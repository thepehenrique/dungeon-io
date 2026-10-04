import Phaser from 'phaser';

import { PLAYER_CLASS_LIST } from '../config/playerClasses';
import type { PlayerClass } from '../types/player';

const PLAYER_TEXTURE_SIZE = 48;

export function getPlayerTextureKey(playerClass: PlayerClass): string {
  return `player-placeholder-${playerClass.toLowerCase()}`;
}

export function createPlayerPlaceholderTextures(scene: Phaser.Scene): void {
  for (const playerClass of PLAYER_CLASS_LIST) {
    const textureKey = getPlayerTextureKey(playerClass.id);

    if (scene.textures.exists(textureKey)) {
      continue;
    }

    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x05070a, 0.7);
    graphics.fillCircle(PLAYER_TEXTURE_SIZE / 2, PLAYER_TEXTURE_SIZE / 2, 23);
    graphics.fillStyle(playerClass.color, 1);
    graphics.fillCircle(PLAYER_TEXTURE_SIZE / 2, PLAYER_TEXTURE_SIZE / 2, 19);
    graphics.fillStyle(0xf7e8b0, 1);
    graphics.fillTriangle(39, 24, 29, 18, 29, 30);
    graphics.generateTexture(textureKey, PLAYER_TEXTURE_SIZE, PLAYER_TEXTURE_SIZE);
    graphics.destroy();
  }
}
