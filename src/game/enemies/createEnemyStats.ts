import { ENEMY_DEFINITIONS } from '../config/enemies';
import type { EnemyStats, EnemyType } from '../types/enemy';

export function createEnemyStats(type: EnemyType): EnemyStats {
  const baseStats = ENEMY_DEFINITIONS[type].baseStats;

  return {
    ...baseStats,
    health: baseStats.maxHealth,
  };
}
