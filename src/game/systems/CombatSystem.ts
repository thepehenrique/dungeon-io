import Phaser from 'phaser';

import { COMBAT_BALANCE } from '../config/combat';
import { Enemy } from '../enemies/Enemy';
import type {
  DamageRequest,
  DamageResult,
  Damageable,
  MeleeAttackData,
} from '../types/combat';

export type EntityDeathHandler = (target: Damageable) => void;

export class CombatSystem {
  private readonly onEntityDeath: EntityDeathHandler;

  constructor(onEntityDeath: EntityDeathHandler) {
    this.onEntityDeath = onEntityDeath;
  }

  applyDamage(target: Damageable, request: DamageRequest): DamageResult {
    if (target.isDead || request.amount <= 0) {
      return {
        appliedDamage: 0,
        remainingHealth: target.combatStats.health,
        killed: false,
      };
    }

    const appliedDamage = this.calculateDamage(
      request.amount,
      target.combatStats.defense,
    );
    target.combatStats.health = Math.max(
      0,
      target.combatStats.health - appliedDamage,
    );
    const killed = target.combatStats.health === 0;

    if (killed) {
      target.die();
      this.onEntityDeath(target);
    }

    return {
      appliedDamage,
      remainingHealth: target.combatStats.health,
      killed,
    };
  }

  applyMeleeAttack(enemies: readonly Enemy[], attack: MeleeAttackData): void {
    for (const enemy of enemies) {
      if (!enemy.active || enemy.isDead || enemy.enemyId === attack.sourceId) {
        continue;
      }

      const offset = new Phaser.Math.Vector2(
        enemy.x - attack.origin.x,
        enemy.y - attack.origin.y,
      );

      if (offset.lengthSq() > attack.range ** 2) {
        continue;
      }

      const angleDifference = Math.abs(
        Phaser.Math.Angle.Wrap(offset.angle() - attack.direction.angle()),
      );

      if (angleDifference <= attack.arc / 2) {
        this.applyDamage(enemy, attack);
      }
    }
  }

  private calculateDamage(rawDamage: number, defense: number): number {
    const mitigatedDamage =
      rawDamage *
      (COMBAT_BALANCE.defenseScale /
        (COMBAT_BALANCE.defenseScale + Math.max(0, defense)));

    return Math.max(COMBAT_BALANCE.minimumDamage, Math.round(mitigatedDamage));
  }
}
