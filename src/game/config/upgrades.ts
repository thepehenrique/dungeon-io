import { UpgradeId, type UpgradeDefinition } from '../types/upgrade';

const VITALITY_INCREASE = 20;
const DAMAGE_INCREASE = 0.1;
const MOVEMENT_SPEED_INCREASE = 0.08;
const ATTACK_SPEED_INCREASE = 0.1;
const DEFENSE_INCREASE = 0.1;

export const UPGRADE_DEFINITIONS: readonly UpgradeDefinition[] = [
  {
    id: UpgradeId.Vitality,
    label: 'Vitalidade',
    description: `+${VITALITY_INCREASE} de vida máxima`,
    symbol: '♥',
    apply: (stats) => {
      stats.maxHealth += VITALITY_INCREASE;
      stats.health += VITALITY_INCREASE;
    },
  },
  {
    id: UpgradeId.Strength,
    label: 'Força',
    description: '+10% de dano',
    symbol: '◆',
    apply: (stats) => {
      stats.damage = increaseByPercentage(stats.damage, DAMAGE_INCREASE);
    },
  },
  {
    id: UpgradeId.Agility,
    label: 'Agilidade',
    description: '+8% de velocidade de movimento',
    symbol: '➤',
    apply: (stats) => {
      stats.movementSpeed = increaseByPercentage(
        stats.movementSpeed,
        MOVEMENT_SPEED_INCREASE,
      );
    },
  },
  {
    id: UpgradeId.AttackSpeed,
    label: 'Velocidade de Ataque',
    description: '+10% de velocidade de ataque',
    symbol: '⚡',
    apply: (stats) => {
      stats.attackSpeed = increaseByPercentage(
        stats.attackSpeed,
        ATTACK_SPEED_INCREASE,
      );
    },
  },
  {
    id: UpgradeId.Defense,
    label: 'Defesa',
    description: '+10% de defesa',
    symbol: '⬟',
    apply: (stats) => {
      stats.defense = increaseByPercentage(stats.defense, DEFENSE_INCREASE);
    },
  },
] as const;

function increaseByPercentage(value: number, percentage: number): number {
  return Math.round(value * (1 + percentage) * 100) / 100;
}
