import Phaser from 'phaser';

import { WORLD_ITEM_TEXTURE_KEYS } from '../../config/drops';

export function createWorldItemPlaceholderTextures(scene: Phaser.Scene): void {
  createEquipmentTexture(scene);
  createBackpackTexture(scene);
  createGoldTexture(scene);
}

function createEquipmentTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(WORLD_ITEM_TEXTURE_KEYS.equipment)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0x17212d, 1);
  graphics.fillRoundedRect(1, 1, 30, 30, 5);
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.lineBetween(9, 23, 23, 9);
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.lineBetween(8, 17, 15, 24);
  graphics.generateTexture(WORLD_ITEM_TEXTURE_KEYS.equipment, 32, 32);
  graphics.destroy();
}

function createBackpackTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(WORLD_ITEM_TEXTURE_KEYS.backpack)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokeRoundedRect(8, 2, 16, 12, 6);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRoundedRect(3, 9, 26, 22, 5);
  graphics.fillStyle(0x17212d, 1);
  graphics.fillRect(8, 18, 16, 4);
  graphics.generateTexture(WORLD_ITEM_TEXTURE_KEYS.backpack, 32, 32);
  graphics.destroy();
}

function createGoldTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(WORLD_ITEM_TEXTURE_KEYS.gold)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0xf0cb6a, 1);
  graphics.fillCircle(14, 14, 12);
  graphics.lineStyle(3, 0x9c682c, 1);
  graphics.strokeCircle(14, 14, 11);
  graphics.fillStyle(0x9c682c, 1);
  graphics.fillRect(12, 7, 4, 14);
  graphics.generateTexture(WORLD_ITEM_TEXTURE_KEYS.gold, 28, 28);
  graphics.destroy();
}
