import type { PlayerStats } from './player';

export enum UpgradeId {
  Vitality = 'VITALITY',
  Strength = 'STRENGTH',
  Agility = 'AGILITY',
  AttackSpeed = 'ATTACK_SPEED',
  Defense = 'DEFENSE',
}

export interface UpgradeDefinition {
  readonly id: UpgradeId;
  readonly label: string;
  readonly description: string;
  readonly symbol: string;
  readonly apply: (stats: PlayerStats) => void;
}
