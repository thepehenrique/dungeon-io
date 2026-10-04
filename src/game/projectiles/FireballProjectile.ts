import Phaser from 'phaser';

import { FIREBALL_CONFIG } from '../config/weapons';
import { AttackKind } from '../types/combat';
import { BaseProjectile, type ProjectileLaunchData } from './BaseProjectile';

export class FireballProjectile extends BaseProjectile {
  readonly attackKind = AttackKind.Magic;

  constructor(scene: Phaser.Scene, launchData: ProjectileLaunchData) {
    super(scene, FIREBALL_CONFIG, launchData);
  }
}
