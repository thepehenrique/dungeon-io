import Phaser from 'phaser';

import { INITIAL_ENEMY_SPAWNS } from '../config/enemies';
import type { Player } from '../player/Player';
import { Enemy } from './Enemy';
import { createEnemy } from './createEnemy';

export class EnemyManager {
  readonly group: Phaser.Physics.Arcade.Group;

  private readonly player: Player;
  private readonly colliders: Phaser.Physics.Arcade.Collider[];

  constructor(
    scene: Phaser.Scene,
    player: Player,
    walls: Phaser.Physics.Arcade.StaticGroup,
  ) {
    this.player = player;
    this.group = scene.physics.add.group({ allowGravity: false });

    for (const spawn of INITIAL_ENEMY_SPAWNS) {
      this.group.add(createEnemy(scene, spawn));
    }

    this.colliders = [
      scene.physics.add.collider(this.group, walls),
      scene.physics.add.collider(this.group, this.group),
      scene.physics.add.collider(player, this.group),
    ];
  }

  update(): void {
    for (const child of [...this.group.getChildren()]) {
      if (child instanceof Enemy && child.active) {
        child.updateAI(this.player);
      }
    }
  }

  destroy(): void {
    for (const collider of this.colliders) {
      collider.destroy();
    }

    this.group.clear(true, true);
  }
}
