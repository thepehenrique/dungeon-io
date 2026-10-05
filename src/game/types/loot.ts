import type { EquipmentDefinition, EquipmentResult } from './equipment';
import type { ConsumableType } from './consumable';
import type { ItemRarity } from './item';
import type { PlayerClass } from './player';
import type { RunState } from './run';

export enum LootType {
  Gold = 'GOLD',
  Consumable = 'CONSUMABLE',
  Equipment = 'EQUIPMENT',
  TemporaryUpgrade = 'TEMPORARY_UPGRADE',
}

export enum LootDelivery {
  Immediate = 'IMMEDIATE',
  Pickup = 'PICKUP',
}

export interface LootContext {
  readonly playerClass: PlayerClass;
  readonly run: RunState;
  readonly equipEquipment: (equipment: EquipmentDefinition) => EquipmentResult;
}

interface BaseLootDefinition {
  readonly id: string;
  readonly type: LootType;
  readonly rarity: ItemRarity;
  readonly label: string;
  readonly color: string;
  readonly canDrop?: (context: LootContext) => boolean;
}

export interface ImmediateLootDefinition extends BaseLootDefinition {
  readonly delivery: LootDelivery.Immediate;
  readonly apply: (context: LootContext, quantity: number) => string;
}

export interface ConsumableLootDefinition extends BaseLootDefinition {
  readonly type: LootType.Consumable;
  readonly delivery: LootDelivery.Pickup;
  readonly consumableType: ConsumableType;
}

export type LootDefinition = ImmediateLootDefinition | ConsumableLootDefinition;

export interface LootTableEntry {
  readonly loot: LootDefinition;
  readonly weight: number;
  readonly minimumQuantity: number;
  readonly maximumQuantity: number;
}

export interface LootDrop {
  readonly definition: LootDefinition;
  readonly quantity: number;
}

export type ChestLootResult =
  | {
      readonly delivery: LootDelivery.Immediate;
      readonly drop: LootDrop;
      readonly message: string;
    }
  | {
      readonly delivery: LootDelivery.Pickup;
      readonly drop: LootDrop;
      readonly consumableType: ConsumableType;
    };
