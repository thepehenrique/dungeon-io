import Phaser from 'phaser';

import { EnemyType } from '../types/enemy';
import { Enemy } from './Enemy';

export class SkeletonWarrior extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, level: number) {
    super(scene, x, y, EnemyType.SkeletonWarrior, level);
  }
}
