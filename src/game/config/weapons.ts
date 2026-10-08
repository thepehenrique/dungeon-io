import Phaser from 'phaser';

import type { ProjectileDefinition } from '../types/combat';

export const SWORD_CONFIG = {
  swingArc: Phaser.Math.DegToRad(100),
} as const;

export const ARROW_CONFIG: ProjectileDefinition = {
  textureKey: 'projectile-arrow',
  initialFrame: 'arrow-default',
  displayScale: 44 / 1510,
  speed: 720,
  bodyRadius: 4,
  spawnOffset: 34,
};

export const FIREBALL_CONFIG: ProjectileDefinition = {
  textureKey: 'projectile-fireball',
  initialFrame: 'fireball-0',
  displayScale: 64 / 313,
  speed: 500,
  bodyRadius: 9,
  spawnOffset: 38,
};

export const FIREBALL_ANIMATION_KEY = 'projectile-fireball-fly';
