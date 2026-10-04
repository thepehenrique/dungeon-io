import { UPGRADE_DEFINITIONS } from '../config/upgrades';
import type { PlayerStats } from '../types/player';
import type { UpgradeDefinition } from '../types/upgrade';

export class UpgradeSystem {
  private readonly random: () => number;

  constructor(random: () => number = Math.random) {
    this.random = random;
  }

  getRandomChoices(count: number): readonly UpgradeDefinition[] {
    const choiceCount = Math.min(
      Math.max(0, Math.floor(count)),
      UPGRADE_DEFINITIONS.length,
    );
    const pool = [...UPGRADE_DEFINITIONS];

    for (let index = 0; index < choiceCount; index += 1) {
      const remainingChoices = pool.length - index;
      const randomIndex = index + Math.floor(this.random() * remainingChoices);
      [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
    }

    return pool.slice(0, choiceCount);
  }

  apply(upgrade: UpgradeDefinition, stats: PlayerStats): void {
    upgrade.apply(stats);
  }
}
