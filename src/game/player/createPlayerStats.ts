import { PLAYER_CLASSES } from '../config/playerClasses';
import type { PlayerClass, PlayerStats } from '../types/player';

export function createPlayerStats(playerClass: PlayerClass): PlayerStats {
  const baseStats = PLAYER_CLASSES[playerClass].baseStats;

  return {
    ...baseStats,
    health: baseStats.maxHealth,
  };
}
