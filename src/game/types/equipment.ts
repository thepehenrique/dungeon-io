import type { PlayerClass } from './player';

export enum EquipmentType {
  Weapon = 'WEAPON',
  Armor = 'ARMOR',
  Shield = 'SHIELD',
  Staff = 'STAFF',
  Bow = 'BOW',
}

export enum EquipmentSlot {
  MainHand = 'MAIN_HAND',
  Armor = 'ARMOR',
  OffHand = 'OFF_HAND',
}

export enum ModifierMode {
  Flat = 'FLAT',
  Percentage = 'PERCENTAGE',
}

export type EquipmentStat =
  | 'maxHealth'
  | 'damage'
  | 'defense'
  | 'movementSpeed'
  | 'attackSpeed'
  | 'attackRange'
  | 'criticalChance'
  | 'criticalMultiplier';

export interface EquipmentModifier {
  readonly stat: EquipmentStat;
  readonly mode: ModifierMode;
  readonly value: number;
}

export interface EquipmentDefinition {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly type: EquipmentType;
  readonly slot: EquipmentSlot;
  readonly rarity: import('./loot').Rarity;
  readonly allowedClasses: readonly PlayerClass[];
  readonly modifiers: readonly EquipmentModifier[];
}

export interface EquipmentResult {
  readonly equipped: EquipmentDefinition;
  readonly replaced: EquipmentDefinition | null;
}
