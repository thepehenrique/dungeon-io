import Phaser from 'phaser';

export const OBJECTIVE_TEXTURE_KEYS = {
  dungeonKey: 'objective-dungeon-key',
  exitDoor: 'objective-exit-door',
} as const;

const EXIT_DOOR_ASSET_PATH = 'assets/objectives/turquoise-rune-exit-door.png';

export function preloadObjectiveTextures(scene: Phaser.Scene): void {
  scene.load.image(OBJECTIVE_TEXTURE_KEYS.exitDoor, EXIT_DOOR_ASSET_PATH);
}

export function createObjectiveTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists(OBJECTIVE_TEXTURE_KEYS.dungeonKey)) {
    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xf5c451, 1);
    graphics.fillCircle(12, 12, 8);
    graphics.fillStyle(0x151921, 1);
    graphics.fillCircle(12, 12, 3);
    graphics.fillStyle(0xf5c451, 1);
    graphics.fillRect(18, 10, 24, 5);
    graphics.fillRect(34, 15, 5, 7);
    graphics.fillRect(27, 15, 5, 5);
    graphics.generateTexture(OBJECTIVE_TEXTURE_KEYS.dungeonKey, 46, 28);
    graphics.destroy();
  }

  if (!scene.textures.exists(OBJECTIVE_TEXTURE_KEYS.exitDoor)) {
    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x171d26, 1);
    graphics.fillRoundedRect(2, 2, 60, 76, 22);
    graphics.lineStyle(5, 0x657284, 1);
    graphics.strokeRoundedRect(2, 2, 60, 76, 22);
    graphics.fillStyle(0x34251c, 1);
    graphics.fillRoundedRect(12, 15, 40, 63, 13);
    graphics.lineStyle(3, 0x9a6d3d, 1);
    graphics.strokeRoundedRect(12, 15, 40, 63, 13);
    graphics.fillStyle(0xd2aa59, 1);
    graphics.fillCircle(43, 48, 4);
    graphics.generateTexture(OBJECTIVE_TEXTURE_KEYS.exitDoor, 64, 80);
    graphics.destroy();
  }
}
