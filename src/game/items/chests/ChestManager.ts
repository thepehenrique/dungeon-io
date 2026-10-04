import Phaser from 'phaser';

import { INITIAL_CHEST_SPAWNS } from '../../config/chests';
import type { Player } from '../../player/Player';
import { Chest } from './Chest';

export type ChestOpenedHandler = (chest: Chest) => void;

export class ChestManager {
  readonly group: Phaser.Physics.Arcade.StaticGroup;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    onChestOpened: ChestOpenedHandler,
  ) {
    this.group = scene.physics.add.staticGroup();

    for (const spawn of INITIAL_CHEST_SPAWNS) {
      const chest = new Chest(scene, spawn.x, spawn.y, spawn.rarity);
      this.group.add(chest);
    }

    scene.physics.add.collider(player, this.group, (_player, chestObject) => {
      if (chestObject instanceof Chest && chestObject.open()) {
        onChestOpened(chestObject);
      }
    });
  }
}
