import { PlayerClass, type PlayerClassDefinition } from '../types/player';

export const PLAYER_CLASSES: Readonly<Record<PlayerClass, PlayerClassDefinition>> = {
  [PlayerClass.Warrior]: {
    id: PlayerClass.Warrior,
    label: 'Guerreiro',
    fantasy: 'Resistente e implacável no combate próximo.',
    color: 0x4d8dff,
    cssColor: '#4d8dff',
  },
  [PlayerClass.Archer]: {
    id: PlayerClass.Archer,
    label: 'Arqueiro',
    fantasy: 'Ágil e preciso a longa distância.',
    color: 0x58c878,
    cssColor: '#58c878',
  },
  [PlayerClass.Mage]: {
    id: PlayerClass.Mage,
    label: 'Mago',
    fantasy: 'Frágil, mas dotado de grande poder arcano.',
    color: 0xa778e8,
    cssColor: '#a778e8',
  },
};

export const PLAYER_CLASS_LIST = Object.values(PLAYER_CLASSES);
