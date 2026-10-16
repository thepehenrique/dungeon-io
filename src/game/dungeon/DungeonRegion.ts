import { EnemyType } from '../types/enemy';

export type DungeonRegion = 'catacombs' | 'goblin_den';

export const REGION_CONFIG = {
  catacombs: {
    enemyPool: [EnemyType.Goblin, EnemyType.SkeletonWarrior, EnemyType.Zombie],
    objectiveSpawns: true,
  },
  goblin_den: {
    enemyPool: [EnemyType.Goblin],
    objectiveSpawns: false,
  },
} satisfies Record<DungeonRegion, { enemyPool: readonly EnemyType[]; objectiveSpawns: boolean }>;

export function isDungeonRegion(value: unknown): value is DungeonRegion {
  return typeof value === 'string' && Object.hasOwn(REGION_CONFIG, value);
}
