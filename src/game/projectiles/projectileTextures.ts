import Phaser from 'phaser';

import { ARROW_CONFIG, FIREBALL_CONFIG } from '../config/weapons';

export function createProjectilePlaceholderTextures(scene: Phaser.Scene): void {
  createArrowTexture(scene);
  createFireballTexture(scene);
}

function createArrowTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(ARROW_CONFIG.textureKey)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0xd5b474, 1);
  graphics.fillRect(2, 4, 22, 3);
  graphics.fillStyle(0xe7edf5, 1);
  graphics.fillTriangle(30, 5.5, 22, 1, 22, 10);
  graphics.generateTexture(ARROW_CONFIG.textureKey, 32, 12);
  graphics.destroy();
}

function createFireballTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(FIREBALL_CONFIG.textureKey)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0xd84020, 0.4);
  graphics.fillCircle(12, 12, 12);
  graphics.fillStyle(0xff6b2c, 1);
  graphics.fillCircle(12, 12, 9);
  graphics.fillStyle(0xffdc73, 1);
  graphics.fillCircle(12, 12, 4);
  graphics.generateTexture(FIREBALL_CONFIG.textureKey, 24, 24);
  graphics.destroy();
}
