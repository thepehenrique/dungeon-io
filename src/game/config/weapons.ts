import Phaser from 'phaser';

import type { ProjectileDefinition } from '../types/combat';

export const SWORD_CONFIG = {
  swingArc: Phaser.Math.DegToRad(100),
  swingDurationMs: 150,
  bladeThickness: 12,
  bladeColor: 0xdce7f2,
  bladeBorderColor: 0x7ca8d8,
} as const;

export const ARROW_CONFIG: ProjectileDefinition = {
  textureKey: 'projectile-arrow',
  speed: 720,
  bodyRadius: 4,
  spawnOffset: 34,
};

export const FIREBALL_CONFIG: ProjectileDefinition = {
  textureKey: 'projectile-fireball',
  speed: 500,
  bodyRadius: 9,
  spawnOffset: 38,
};
