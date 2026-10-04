import { PlayerClass, type PlayerClassDefinition } from '../types/player';

export const PLAYER_CLASSES: Readonly<Record<PlayerClass, PlayerClassDefinition>> = {
  [PlayerClass.Warrior]: {
    id: PlayerClass.Warrior,
    label: 'Guerreiro',
    fantasy: 'Resistente e implacável no combate próximo.',
    color: 0x4d8dff,
    cssColor: '#4d8dff',
    baseStats: {
      maxHealth: 160,
      damage: 24,
      defense: 12,
      movementSpeed: 210,
      attackSpeed: 0.85,
      attackRange: 82,
      criticalChance: 0.05,
    },
  },
  [PlayerClass.Archer]: {
    id: PlayerClass.Archer,
    label: 'Arqueiro',
    fantasy: 'Ágil e preciso a longa distância.',
    color: 0x58c878,
    cssColor: '#58c878',
    baseStats: {
      maxHealth: 110,
      damage: 18,
      defense: 5,
      movementSpeed: 285,
      attackSpeed: 1.25,
      attackRange: 560,
      criticalChance: 0.08,
    },
  },
  [PlayerClass.Mage]: {
    id: PlayerClass.Mage,
    label: 'Mago',
    fantasy: 'Frágil, mas dotado de grande poder arcano.',
    color: 0xa778e8,
    cssColor: '#a778e8',
    baseStats: {
      maxHealth: 90,
      damage: 28,
      defense: 3,
      movementSpeed: 240,
      attackSpeed: 1,
      attackRange: 480,
      criticalChance: 0.05,
    },
  },
};

export const PLAYER_CLASS_LIST = Object.values(PLAYER_CLASSES);
