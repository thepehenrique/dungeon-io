import Phaser from 'phaser';

import { INITIAL_CHEST_SPAWNS } from '../../config/chests';
import type { Player } from '../../player/Player';
import type { ChestSpawnDefinition } from '../../types/chest';
import { Chest } from './Chest';

export class ChestManager {
  readonly group: Phaser.Physics.Arcade.StaticGroup;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    spawns: readonly ChestSpawnDefinition[] = INITIAL_CHEST_SPAWNS,
  ) {
    this.group = scene.physics.add.staticGroup();

    for (const spawn of spawns) {
      const chest = new Chest(scene, spawn.x, spawn.y, spawn.rarity);
      this.group.add(chest);
    }

    scene.physics.add.collider(player, this.group);
  }

  getChests(): readonly Chest[] {
    return this.group
      .getChildren()
      .filter((child): child is Chest => child instanceof Chest);
  }
}
