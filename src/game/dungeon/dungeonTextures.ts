import Phaser from 'phaser';

export const DUNGEON_TEXTURE_KEYS = {
  torch: 'dungeon-torch',
  barrel: 'dungeon-barrel',
  crate: 'dungeon-crate',
  bones: 'dungeon-bones',
  web: 'dungeon-web',
} as const;

export function createDungeonPlaceholderTextures(scene: Phaser.Scene): void {
  createTorchTexture(scene);
  createBarrelTexture(scene);
  createCrateTexture(scene);
  createBonesTexture(scene);
  createWebTexture(scene);
}

function createTorchTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(DUNGEON_TEXTURE_KEYS.torch)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0x603d25, 1);
  graphics.fillRoundedRect(9, 18, 6, 25, 2);
  graphics.fillStyle(0xe96524, 1);
  graphics.fillTriangle(4, 22, 20, 22, 12, 1);
  graphics.fillStyle(0xffc64b, 1);
  graphics.fillTriangle(8, 20, 16, 20, 12, 7);
  graphics.generateTexture(DUNGEON_TEXTURE_KEYS.torch, 24, 44);
  graphics.destroy();
}

function createBarrelTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(DUNGEON_TEXTURE_KEYS.barrel)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0x3b261a, 1);
  graphics.fillRoundedRect(3, 2, 30, 40, 9);
  graphics.fillStyle(0x714829, 1);
  graphics.fillRoundedRect(6, 3, 24, 38, 7);
  graphics.lineStyle(4, 0x25272b, 1);
  graphics.lineBetween(5, 11, 31, 11);
  graphics.lineBetween(4, 32, 32, 32);
  graphics.lineStyle(2, 0x9a6538, 0.75);
  graphics.lineBetween(18, 4, 18, 40);
  graphics.generateTexture(DUNGEON_TEXTURE_KEYS.barrel, 36, 44);
  graphics.destroy();
}

function createCrateTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(DUNGEON_TEXTURE_KEYS.crate)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0x6b4728, 1);
  graphics.fillRect(2, 2, 38, 38);
  graphics.lineStyle(4, 0x392719, 1);
  graphics.strokeRect(2, 2, 38, 38);
  graphics.lineBetween(5, 5, 37, 37);
  graphics.lineBetween(37, 5, 5, 37);
  graphics.lineStyle(2, 0xa57743, 0.8);
  graphics.strokeRect(7, 7, 28, 28);
  graphics.generateTexture(DUNGEON_TEXTURE_KEYS.crate, 42, 42);
  graphics.destroy();
}

function createBonesTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(DUNGEON_TEXTURE_KEYS.bones)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.lineStyle(5, 0xc8c1aa, 1);
  graphics.lineBetween(9, 22, 38, 7);
  graphics.lineBetween(10, 7, 39, 22);
  graphics.fillStyle(0xd8d0b9, 1);
  for (const [x, y] of [[7, 6], [11, 8], [37, 5], [40, 9], [7, 20], [11, 23], [37, 20], [41, 23]]) {
    graphics.fillCircle(x, y, 4);
  }
  graphics.generateTexture(DUNGEON_TEXTURE_KEYS.bones, 48, 28);
  graphics.destroy();
}

function createWebTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(DUNGEON_TEXTURE_KEYS.web)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.lineStyle(1, 0xaeb8c2, 0.55);
  graphics.lineBetween(2, 2, 46, 46);
  graphics.lineBetween(2, 46, 46, 2);
  graphics.lineBetween(24, 1, 24, 47);
  graphics.lineBetween(1, 24, 47, 24);
  graphics.strokeCircle(24, 24, 9);
  graphics.strokeCircle(24, 24, 17);
  graphics.generateTexture(DUNGEON_TEXTURE_KEYS.web, 48, 48);
  graphics.destroy();
}
