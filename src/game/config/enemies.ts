import {
  EnemyType,
  type EnemyDefinition,
  type EnemySpawnDefinition,
} from '../types/enemy';

export const ENEMY_DEFINITIONS: Readonly<Record<EnemyType, EnemyDefinition>> = {
  [EnemyType.Goblin]: {
    type: EnemyType.Goblin,
    label: 'Goblin',
    color: 0x72bd4b,
    textureKey: 'enemy-goblin',
    bodyRadius: 16,
    baseStats: {
      maxHealth: 45,
      damage: 10,
      defense: 2,
      movementSpeed: 175,
      attackSpeed: 1.2,
      detectionRange: 480,
      attackRange: 50,
      experienceReward: 10,
    },
  },
  [EnemyType.SkeletonWarrior]: {
    type: EnemyType.SkeletonWarrior,
    label: 'Skeleton Warrior',
    color: 0xd8d2bb,
    textureKey: 'enemy-skeleton-warrior',
    bodyRadius: 18,
    baseStats: {
      maxHealth: 80,
      damage: 12,
      defense: 5,
      movementSpeed: 125,
      attackSpeed: 0.85,
      detectionRange: 450,
      attackRange: 54,
      experienceReward: 20,
    },
  },
  [EnemyType.Zombie]: {
    type: EnemyType.Zombie,
    label: 'Zombie',
    color: 0x78916c,
    textureKey: 'enemy-zombie',
    bodyRadius: 21,
    baseStats: {
      maxHealth: 130,
      damage: 18,
      defense: 8,
      movementSpeed: 75,
      attackSpeed: 0.55,
      detectionRange: 420,
      attackRange: 60,
      experienceReward: 25,
    },
  },
};

export const INITIAL_ENEMY_SPAWNS: readonly EnemySpawnDefinition[] = [
  { type: EnemyType.Goblin, x: 650, y: 380, level: 1 },
  { type: EnemyType.SkeletonWarrior, x: 410, y: 680, level: 1 },
  { type: EnemyType.Zombie, x: 680, y: 650, level: 1 },
] as const;

export const ENEMY_WAVE_CONFIG = {
  intermissionMs: 15_000,
} as const;
