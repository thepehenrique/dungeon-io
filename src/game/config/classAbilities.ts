import Phaser from 'phaser';

export const WARRIOR_BLOCK_CONFIG = {
  damageReduction: 0.7,
  movementMultiplier: 0.5,
  frontalArc: Phaser.Math.DegToRad(120),
} as const;

export const ARCHER_DASH_CONFIG = {
  distance: 120,
  durationMs: 150,
  cooldownMs: 2_000,
} as const;

export const MAGE_PROTECTION_CONFIG = {
  durationMs: 2_000,
  cooldownMs: 6_000,
  damageReduction: 0.7,
} as const;

export const CLASS_ABILITY_PRESENTATION = {
  warriorReady: '[SPACE] BLOCK',
  warriorActive: '[SPACE] BLOCKING',
  archerReady: '[SPACE] DASH',
  archerActive: '[SPACE] DASH ACTIVE',
  mageReady: '[SPACE] PROTECTION',
  mageActive: '[SPACE] PROTECTION ACTIVE',
} as const;
