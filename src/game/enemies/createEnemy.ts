import Phaser from 'phaser';

import type { EnemySpawnDefinition } from '../types/enemy';
import { EnemyType } from '../types/enemy';
import type { Enemy } from './Enemy';
import { Goblin } from './Goblin';
import { SkeletonWarrior } from './SkeletonWarrior';
import { Zombie } from './Zombie';

export function createEnemy(
  scene: Phaser.Scene,
  spawn: EnemySpawnDefinition,
): Enemy {
  switch (spawn.type) {
    case EnemyType.Goblin:
      return new Goblin(scene, spawn.x, spawn.y, spawn.level);
    case EnemyType.SkeletonWarrior:
      return new SkeletonWarrior(scene, spawn.x, spawn.y, spawn.level);
    case EnemyType.Zombie:
      return new Zombie(scene, spawn.x, spawn.y, spawn.level);
  }
}
