import Phaser from 'phaser';

import { SWORD_CONFIG } from '../config/weapons';
import type { Player } from '../player/Player';
import { AttackKind, type MeleeAttackHandler } from '../types/combat';
import { PrimaryWeapon } from './PrimaryWeapon';

export class SwordWeapon extends PrimaryWeapon {
  readonly attackKind = AttackKind.Melee;
  private readonly onMeleeAttack: MeleeAttackHandler;

  constructor(
    scene: Phaser.Scene,
    owner: Player,
    onMeleeAttack: MeleeAttackHandler,
  ) {
    super(scene, owner);
    this.onMeleeAttack = onMeleeAttack;
  }

  protected performAttack(direction: Phaser.Math.Vector2): void {
    this.owner.playSwordAttack(direction);

    this.onMeleeAttack({
      sourceId: this.owner.playerId,
      amount: this.owner.stats.damage,
      attackKind: this.attackKind,
      origin: new Phaser.Math.Vector2(this.owner.x, this.owner.y),
      direction: direction.clone(),
      range: this.owner.stats.attackRange,
      arc: SWORD_CONFIG.swingArc,
      critical: {
        chance: this.owner.stats.criticalChance,
        multiplier: this.owner.stats.criticalMultiplier,
      },
    });
  }
}
