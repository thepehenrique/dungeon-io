import Phaser from 'phaser';

import { RUN_OBJECTIVE_CONFIG } from '../config/runObjective';
import { OBJECTIVE_TEXTURE_KEYS } from './objectiveTextures';

export class ExitDoor extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, OBJECTIVE_TEXTURE_KEYS.exitDoor);
    scene.add.existing(this);
    this.setOrigin(0.5, 1)
      .setDisplaySize(
        RUN_OBJECTIVE_CONFIG.exitDoorDisplaySize,
        RUN_OBJECTIVE_CONFIG.exitDoorDisplaySize,
      )
      .setDepth(13);
  }

  setSelected(selected: boolean): void {
    this.setTint(selected ? 0xffe7a2 : 0xffffff);
  }
}
