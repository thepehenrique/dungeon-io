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
  getIncomingDamageMultiplier(request: DamageRequest): number;
  playHitFeedback(): void;
  die(): void;
}

export interface CriticalStrikeData {
  readonly chance: number;
  readonly multiplier: number;
}

export interface DamageRequest {
  readonly sourceId: string;
  readonly amount: number;
  readonly attackKind: AttackKind;
  readonly sourcePosition?: Phaser.Math.Vector2;
  readonly critical?: CriticalStrikeData;
}

export interface DamageResult {
  readonly appliedDamage: number;
  readonly remainingHealth: number;
  readonly killed: boolean;
  readonly critical: boolean;
  readonly ignored: boolean;
  readonly damageReductionApplied: boolean;
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
