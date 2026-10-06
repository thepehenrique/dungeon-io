import type { PlayerClass } from './player';

export enum ItemType {
  Equipment = 'EQUIPMENT',
  Consumable = 'CONSUMABLE',
  Backpack = 'BACKPACK',
}

export enum ItemRarity {
  Common = 'COMMON',
  Uncommon = 'UNCOMMON',
  Rare = 'RARE',
  Epic = 'EPIC',
  Legendary = 'LEGENDARY',
}

export interface ItemDefinition {
  readonly id: string;
  readonly name: string;
  readonly type: ItemType;
  readonly rarity: ItemRarity;
  readonly description?: string;
}

export enum EquipmentSlot {
  Weapon = 'WEAPON',
  Armor = 'ARMOR',
}

export enum EquipmentKind {
  Sword = 'SWORD',
  Bow = 'BOW',
  Staff = 'STAFF',
  Armor = 'ARMOR',
}

export enum ItemStat {
  Damage = 'damage',
  Defense = 'defense',
  MaxHealth = 'maxHealth',
  AttackSpeed = 'attackSpeed',
  MovementSpeed = 'movementSpeed',
  CriticalChance = 'criticalChance',
}

export enum ModifierMode {
  Flat = 'FLAT',
  Percent = 'PERCENT',
}

export interface ItemModifier {
  readonly stat: ItemStat;
  readonly value: number;
  readonly mode: ModifierMode;
}

export interface EquipmentDefinition extends ItemDefinition {
  readonly type: ItemType.Equipment;
  readonly slot: EquipmentSlot;
  readonly kind: EquipmentKind;
  readonly allowedClasses: readonly PlayerClass[];
  readonly modifiers: readonly ItemModifier[];
}

export enum ConsumableType {
  MinorHealthPotion = 'MINOR_HEALTH_POTION',
  MajorHealthPotion = 'MAJOR_HEALTH_POTION',
}

export enum ConsumableEffectType {
  Heal = 'HEAL',
}

export interface HealEffect {
  readonly type: ConsumableEffectType.Heal;
  readonly amount: number;
}

export type ConsumableEffect = HealEffect;

export interface ConsumableDefinition extends ItemDefinition {
  readonly type: ItemType.Consumable;
  readonly consumableType: ConsumableType;
  readonly effect: ConsumableEffect;
  readonly stackLimit: number;
  readonly color: string;
  readonly textureKey: string;
  readonly pickupRadius: number;
}

export enum BackpackKind {
  Small = 'SMALL_BACKPACK',
  Medium = 'MEDIUM_BACKPACK',
  Large = 'LARGE_BACKPACK',
}

export interface BackpackDefinition extends ItemDefinition {
  readonly type: ItemType.Backpack;
  readonly backpackKind: BackpackKind;
  readonly capacity: number;
}

export type RegisteredItemDefinition =
  | EquipmentDefinition
  | ConsumableDefinition
  | BackpackDefinition;

export interface ItemInstance {
  readonly instanceId: string;
  readonly definitionId: string;
}
