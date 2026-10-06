import {
  EquipmentKind,
  EquipmentSlot,
  ItemRarity,
  ItemStat,
  ItemType,
  ModifierMode,
  type EquipmentDefinition,
} from '../types/item';
import { PlayerClass } from '../types/player';

const ALL_CLASSES = [
  PlayerClass.Warrior,
  PlayerClass.Archer,
  PlayerClass.Mage,
] as const;

export const EQUIPMENT_KIND_ALLOWED_CLASSES: Readonly<
  Record<EquipmentKind, readonly PlayerClass[]>
> = {
  [EquipmentKind.Sword]: [PlayerClass.Warrior],
  [EquipmentKind.Bow]: [PlayerClass.Archer],
  [EquipmentKind.Staff]: [PlayerClass.Mage],
  [EquipmentKind.Armor]: ALL_CLASSES,
};

export const EQUIPMENT_DEFINITIONS = {
  rustySword: {
    id: 'rusty_sword',
    name: 'Espada Enferrujada',
    description: '+3 de dano',
    type: ItemType.Equipment,
    rarity: ItemRarity.Common,
    slot: EquipmentSlot.Weapon,
    kind: EquipmentKind.Sword,
    allowedClasses: EQUIPMENT_KIND_ALLOWED_CLASSES[EquipmentKind.Sword],
    modifiers: [
      { stat: ItemStat.Damage, mode: ModifierMode.Flat, value: 3 },
    ],
  },
  ironSword: {
    id: 'iron_sword',
    name: 'Espada de Ferro',
    description: '+6 de dano',
    type: ItemType.Equipment,
    rarity: ItemRarity.Uncommon,
    slot: EquipmentSlot.Weapon,
    kind: EquipmentKind.Sword,
    allowedClasses: EQUIPMENT_KIND_ALLOWED_CLASSES[EquipmentKind.Sword],
    modifiers: [
      { stat: ItemStat.Damage, mode: ModifierMode.Flat, value: 6 },
    ],
  },
  simpleBow: {
    id: 'simple_bow',
    name: 'Arco Simples',
    description: '+3 de dano',
    type: ItemType.Equipment,
    rarity: ItemRarity.Common,
    slot: EquipmentSlot.Weapon,
    kind: EquipmentKind.Bow,
    allowedClasses: EQUIPMENT_KIND_ALLOWED_CLASSES[EquipmentKind.Bow],
    modifiers: [
      { stat: ItemStat.Damage, mode: ModifierMode.Flat, value: 3 },
    ],
  },
  longBow: {
    id: 'long_bow',
    name: 'Arco Longo',
    description: '+5 de dano e +3% de velocidade de ataque',
    type: ItemType.Equipment,
    rarity: ItemRarity.Uncommon,
    slot: EquipmentSlot.Weapon,
    kind: EquipmentKind.Bow,
    allowedClasses: EQUIPMENT_KIND_ALLOWED_CLASSES[EquipmentKind.Bow],
    modifiers: [
      { stat: ItemStat.Damage, mode: ModifierMode.Flat, value: 5 },
      { stat: ItemStat.AttackSpeed, mode: ModifierMode.Percent, value: 0.03 },
    ],
  },
  woodenStaff: {
    id: 'wooden_staff',
    name: 'Cajado de Madeira',
    description: '+3 de dano',
    type: ItemType.Equipment,
    rarity: ItemRarity.Common,
    slot: EquipmentSlot.Weapon,
    kind: EquipmentKind.Staff,
    allowedClasses: EQUIPMENT_KIND_ALLOWED_CLASSES[EquipmentKind.Staff],
    modifiers: [
      { stat: ItemStat.Damage, mode: ModifierMode.Flat, value: 3 },
    ],
  },
  arcaneStaff: {
    id: 'arcane_staff',
    name: 'Cajado Arcano',
    description: '+5 de dano e +2% de chance de crítico',
    type: ItemType.Equipment,
    rarity: ItemRarity.Uncommon,
    slot: EquipmentSlot.Weapon,
    kind: EquipmentKind.Staff,
    allowedClasses: EQUIPMENT_KIND_ALLOWED_CLASSES[EquipmentKind.Staff],
    modifiers: [
      { stat: ItemStat.Damage, mode: ModifierMode.Flat, value: 5 },
      { stat: ItemStat.CriticalChance, mode: ModifierMode.Flat, value: 0.02 },
    ],
  },
  leatherArmor: {
    id: 'leather_armor',
    name: 'Armadura de Couro',
    description: '+3 de defesa e +10 de vida máxima',
    type: ItemType.Equipment,
    rarity: ItemRarity.Common,
    slot: EquipmentSlot.Armor,
    kind: EquipmentKind.Armor,
    allowedClasses: EQUIPMENT_KIND_ALLOWED_CLASSES[EquipmentKind.Armor],
    modifiers: [
      { stat: ItemStat.Defense, mode: ModifierMode.Flat, value: 3 },
      { stat: ItemStat.MaxHealth, mode: ModifierMode.Flat, value: 10 },
    ],
  },
} as const satisfies Record<string, EquipmentDefinition>;

export const BASE_WEAPON_DEFINITIONS: Readonly<
  Record<PlayerClass, EquipmentDefinition>
> = {
  [PlayerClass.Warrior]: {
    id: 'base_sword',
    name: 'Espada Básica',
    description: 'Arma inicial do Guerreiro.',
    type: ItemType.Equipment,
    rarity: ItemRarity.Common,
    slot: EquipmentSlot.Weapon,
    kind: EquipmentKind.Sword,
    allowedClasses: EQUIPMENT_KIND_ALLOWED_CLASSES[EquipmentKind.Sword],
    modifiers: [],
  },
  [PlayerClass.Archer]: {
    id: 'base_bow',
    name: 'Arco Básico',
    description: 'Arma inicial do Arqueiro.',
    type: ItemType.Equipment,
    rarity: ItemRarity.Common,
    slot: EquipmentSlot.Weapon,
    kind: EquipmentKind.Bow,
    allowedClasses: EQUIPMENT_KIND_ALLOWED_CLASSES[EquipmentKind.Bow],
    modifiers: [],
  },
  [PlayerClass.Mage]: {
    id: 'base_staff',
    name: 'Cajado Básico',
    description: 'Arma inicial do Mago.',
    type: ItemType.Equipment,
    rarity: ItemRarity.Common,
    slot: EquipmentSlot.Weapon,
    kind: EquipmentKind.Staff,
    allowedClasses: EQUIPMENT_KIND_ALLOWED_CLASSES[EquipmentKind.Staff],
    modifiers: [],
  },
};
