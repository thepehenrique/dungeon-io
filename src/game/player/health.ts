export interface MutableHealth {
  health: number;
  maxHealth: number;
}

export function restoreHealth(stats: MutableHealth, amount: number): number {
  if (amount <= 0 || stats.health >= stats.maxHealth) {
    return 0;
  }

  const previousHealth = stats.health;
  stats.health = Math.min(stats.maxHealth, stats.health + amount);
  return stats.health - previousHealth;
}
