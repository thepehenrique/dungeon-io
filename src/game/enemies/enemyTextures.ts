import Phaser from 'phaser';

import { ENEMY_DEFINITIONS } from '../config/enemies';
import { EnemyType } from '../types/enemy';

const TEXTURE_SIZE = 48;
const CENTER = TEXTURE_SIZE / 2;

export function createEnemyPlaceholderTextures(scene: Phaser.Scene): void {
  createGoblinTexture(scene);
  createSkeletonTexture(scene);
  createZombieTexture(scene);
}

function createGoblinTexture(scene: Phaser.Scene): void {
  const definition = ENEMY_DEFINITIONS[EnemyType.Goblin];

  if (scene.textures.exists(definition.textureKey)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0x3c6629, 1);
  graphics.fillTriangle(5, CENTER, 16, 13, 16, 35);
  graphics.fillTriangle(43, CENTER, 32, 13, 32, 35);
  graphics.fillStyle(definition.color, 1);
  graphics.fillCircle(CENTER, CENTER, 17);
  graphics.fillStyle(0xf4db66, 1);
  graphics.fillCircle(18, 21, 3);
  graphics.fillCircle(30, 21, 3);
  graphics.generateTexture(definition.textureKey, TEXTURE_SIZE, TEXTURE_SIZE);
  graphics.destroy();
}

function createSkeletonTexture(scene: Phaser.Scene): void {
  const definition = ENEMY_DEFINITIONS[EnemyType.SkeletonWarrior];

  if (scene.textures.exists(definition.textureKey)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(definition.color, 1);
  graphics.fillCircle(CENTER, 20, 17);
  graphics.fillRect(15, 20, 18, 18);
  graphics.fillStyle(0x30343a, 1);
  graphics.fillCircle(18, 19, 4);
  graphics.fillCircle(30, 19, 4);
  graphics.fillRect(20, 29, 8, 5);
  graphics.generateTexture(definition.textureKey, TEXTURE_SIZE, TEXTURE_SIZE);
  graphics.destroy();
}

function createZombieTexture(scene: Phaser.Scene): void {
  const definition = ENEMY_DEFINITIONS[EnemyType.Zombie];

  if (scene.textures.exists(definition.textureKey)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0x263326, 0.9);
  graphics.fillCircle(CENTER, CENTER, 23);
  graphics.fillStyle(definition.color, 1);
  graphics.fillCircle(CENTER, CENTER, 20);
  graphics.fillStyle(0x332c25, 1);
  graphics.fillRect(14, 17, 8, 5);
  graphics.fillRect(29, 19, 7, 5);
  graphics.generateTexture(definition.textureKey, TEXTURE_SIZE, TEXTURE_SIZE);
  graphics.destroy();
}
