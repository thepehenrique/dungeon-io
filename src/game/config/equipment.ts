import {
  EquipmentSlot,
  EquipmentType,
  ModifierMode,
  type EquipmentDefinition,
} from '../types/equipment';
import { Rarity } from '../types/loot';
import { PlayerClass } from '../types/player';

const ALL_CLASSES = [
  PlayerClass.Warrior,
  PlayerClass.Archer,
  PlayerClass.Mage,
] as const;

export const EQUIPMENT_DEFINITIONS = {
  ironSword: {
    id: 'iron-sword',
    label: 'Espada de ferro',
    description: '+5 de dano',
    type: EquipmentType.Weapon,
    slot: EquipmentSlot.MainHand,
    rarity: Rarity.Common,
    allowedClasses: [PlayerClass.Warrior],
    modifiers: [{ stat: 'damage', mode: ModifierMode.Flat, value: 5 }],
  },
  leatherArmor: {
    id: 'leather-armor',
    label: 'Armadura de couro',
    description: '+10 de vida máxima e +2 de defesa',
    type: EquipmentType.Armor,
    slot: EquipmentSlot.Armor,
    rarity: Rarity.Common,
    allowedClasses: ALL_CLASSES,
    modifiers: [
      { stat: 'maxHealth', mode: ModifierMode.Flat, value: 10 },
      { stat: 'defense', mode: ModifierMode.Flat, value: 2 },
    ],
  },
  woodenShield: {
    id: 'wooden-shield',
    label: 'Escudo de madeira',
    description: '+4 de defesa',
    type: EquipmentType.Shield,
    slot: EquipmentSlot.OffHand,
    rarity: Rarity.Common,
    allowedClasses: [PlayerClass.Warrior],
    modifiers: [{ stat: 'defense', mode: ModifierMode.Flat, value: 4 }],
  },
  apprenticeStaff: {
    id: 'apprentice-staff',
    label: 'Cajado de aprendiz',
    description: '+5 de dano e +5% de velocidade de ataque',
    type: EquipmentType.Staff,
    slot: EquipmentSlot.MainHand,
    rarity: Rarity.Common,
    allowedClasses: [PlayerClass.Mage],
    modifiers: [
      { stat: 'damage', mode: ModifierMode.Flat, value: 5 },
      { stat: 'attackSpeed', mode: ModifierMode.Percentage, value: 0.05 },
    ],
  },
  huntingBow: {
    id: 'hunting-bow',
    label: 'Arco de caça',
    description: '+4 de dano, +3% de movimento e +5% de crítico',
    type: EquipmentType.Bow,
    slot: EquipmentSlot.MainHand,
    rarity: Rarity.Common,
    allowedClasses: [PlayerClass.Archer],
    modifiers: [
      { stat: 'damage', mode: ModifierMode.Flat, value: 4 },
      { stat: 'movementSpeed', mode: ModifierMode.Percentage, value: 0.03 },
      { stat: 'criticalChance', mode: ModifierMode.Flat, value: 0.05 },
    ],
  },
} as const satisfies Record<string, EquipmentDefinition>;
