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
export type DamageAppliedHandler = (
  target: Damageable,
  result: DamageResult,
  request: DamageRequest,
) => void;

export class CombatSystem {
  private readonly scene: Phaser.Scene;
  private readonly onEntityDeath: EntityDeathHandler;
  private readonly onDamageApplied: DamageAppliedHandler;
  private readonly random: () => number;
  private readonly nextDamageAt = new Map<string, number>();

  constructor(
    scene: Phaser.Scene,
    onEntityDeath: EntityDeathHandler,
    onDamageApplied: DamageAppliedHandler,
    random: () => number = Math.random,
  ) {
    this.scene = scene;
    this.onEntityDeath = onEntityDeath;
    this.onDamageApplied = onDamageApplied;
    this.random = random;
  }

  applyDamage(target: Damageable, request: DamageRequest): DamageResult {
    if (
      target.isDead ||
      request.amount <= 0 ||
      this.scene.time.now < (this.nextDamageAt.get(target.combatId) ?? 0)
    ) {
      return this.createIgnoredResult(target);
    }

    const critical = this.rollCritical(request);
    const criticalMultiplier = critical
      ? Math.max(1, request.critical?.multiplier ?? 1)
      : 1;
    const incomingMultiplier = Phaser.Math.Clamp(
      target.getIncomingDamageMultiplier(request),
      0,
      1,
    );
    const appliedDamage = this.calculateDamage(
      request.amount * criticalMultiplier,
      target.combatStats.defense,
      incomingMultiplier,
    );
    target.combatStats.health = Math.max(
      0,
      target.combatStats.health - appliedDamage,
    );
    const killed = target.combatStats.health === 0;
    const result: DamageResult = {
      appliedDamage,
      remainingHealth: target.combatStats.health,
      killed,
      critical,
      ignored: false,
      damageReductionApplied: incomingMultiplier < 1,
    };

    this.nextDamageAt.set(
      target.combatId,
      this.scene.time.now + COMBAT_BALANCE.hitInvulnerabilityMs,
    );
    target.playHitFeedback();
    this.onDamageApplied(target, result, request);

    if (killed) {
      target.die();
      this.onEntityDeath(target);
    }

    return result;
  }

  applyMeleeAttack(enemies: readonly Enemy[], attack: MeleeAttackData): void {
    const hitEnemyIds = new Set<string>();

    for (const enemy of enemies) {
      if (
        !enemy.active ||
        enemy.isDead ||
        enemy.enemyId === attack.sourceId ||
        hitEnemyIds.has(enemy.enemyId)
      ) {
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
        hitEnemyIds.add(enemy.enemyId);
        this.applyDamage(enemy, {
          ...attack,
          sourcePosition: attack.origin,
        });
      }
    }
  }

  private calculateDamage(
    rawDamage: number,
    defense: number,
    incomingMultiplier: number,
  ): number {
    const mitigatedDamage =
      rawDamage *
      (COMBAT_BALANCE.defenseScale /
        (COMBAT_BALANCE.defenseScale + Math.max(0, defense)));

    return Math.max(
      COMBAT_BALANCE.minimumDamage,
      Math.round(mitigatedDamage * incomingMultiplier),
    );
  }

  private rollCritical(request: DamageRequest): boolean {
    if (!request.critical) {
      return false;
    }

    return this.random() < Phaser.Math.Clamp(request.critical.chance, 0, 1);
  }

  private createIgnoredResult(target: Damageable): DamageResult {
    return {
      appliedDamage: 0,
      remainingHealth: target.combatStats.health,
      killed: false,
      critical: false,
      ignored: true,
      damageReductionApplied: false,
    };
  }
}
