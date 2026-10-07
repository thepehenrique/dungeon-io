import Phaser from 'phaser';

import { OBJECTIVE_TEXTURE_KEYS } from './objectiveTextures';

export class ExitDoor extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, OBJECTIVE_TEXTURE_KEYS.exitDoor);
    scene.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(11);
  }

  setSelected(selected: boolean): void {
    this.setTint(selected ? 0xffe7a2 : 0xffffff);
  }
}
