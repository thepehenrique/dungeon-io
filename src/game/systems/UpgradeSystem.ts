import { UPGRADE_DEFINITIONS } from '../config/upgrades';
import type { UpgradeDefinition, UpgradeId, UpgradeState } from '../types/upgrade';

export class UpgradeSystem {
  grantPoint(state: UpgradeState): void {
    state.availablePoints += 1;
  }

  spendPoint(
    state: UpgradeState,
    id: UpgradeId,
    apply: (upgrade: UpgradeDefinition) => void,
  ): boolean {
    const upgrade = UPGRADE_DEFINITIONS.find((candidate) => candidate.id === id);
    if (state.availablePoints < 1 || !upgrade) {
      return false;
    }

    apply(upgrade);
    state.availablePoints -= 1;
    state.levels[id] += 1;
    return true;
  }
}
