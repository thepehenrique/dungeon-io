import Phaser from 'phaser';

export enum AttackKind {
  Melee = 'MELEE',
  Projectile = 'PROJECTILE',
  Magic = 'MAGIC',
}

export interface CombatStats {
  health: number;
  maxHealth: number;
  defense: number;
}

export interface Damageable {
  readonly combatId: string;
  readonly combatStats: CombatStats;
  readonly isDead: boolean;
  readonly x: number;
  readonly y: number;
  die(): void;
}

export interface DamageRequest {
  readonly sourceId: string;
  readonly amount: number;
  readonly attackKind: AttackKind;
}

export interface DamageResult {
  readonly appliedDamage: number;
  readonly remainingHealth: number;
  readonly killed: boolean;
}

export interface MeleeAttackData extends DamageRequest {
  readonly origin: Phaser.Math.Vector2;
  readonly direction: Phaser.Math.Vector2;
  readonly range: number;
  readonly arc: number;
}

export type MeleeAttackHandler = (attack: MeleeAttackData) => void;

export interface ProjectileDefinition {
  readonly textureKey: string;
  readonly speed: number;
  readonly bodyRadius: number;
  readonly spawnOffset: number;
}
