import Phaser from 'phaser';

import { ARROW_CONFIG } from '../config/weapons';
import { AttackKind } from '../types/combat';
import { BaseProjectile, type ProjectileLaunchData } from './BaseProjectile';

export class ArrowProjectile extends BaseProjectile {
  readonly attackKind = AttackKind.Projectile;

  constructor(scene: Phaser.Scene, launchData: ProjectileLaunchData) {
    super(scene, ARROW_CONFIG, launchData);
  }
}
