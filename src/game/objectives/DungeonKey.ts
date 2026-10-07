import Phaser from 'phaser';

import { OBJECTIVE_TEXTURE_KEYS } from './objectiveTextures';

export class DungeonKey extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, OBJECTIVE_TEXTURE_KEYS.dungeonKey);
    scene.add.existing(this);
    this.setDepth(12);
  }

  setSelected(selected: boolean): void {
    this.setTint(selected ? 0xffffff : 0xf5c451);
    this.setScale(selected ? 1.15 : 1);
  }
}
