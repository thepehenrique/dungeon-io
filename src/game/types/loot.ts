import type { EquipmentDefinition, EquipmentResult } from './equipment';
import type { PlayerStats } from './player';
import type { PlayerClass } from './player';
import type { RunState } from './run';

export enum Rarity {
  Common = 'COMMON',
  Rare = 'RARE',
  Epic = 'EPIC',
  Legendary = 'LEGENDARY',
}

export enum LootType {
  Gold = 'GOLD',
  Potion = 'POTION',
  Equipment = 'EQUIPMENT',
  TemporaryUpgrade = 'TEMPORARY_UPGRADE',
}

export interface LootContext {
  readonly playerStats: PlayerStats;
  readonly playerClass: PlayerClass;
  readonly run: RunState;
  readonly equipEquipment: (equipment: EquipmentDefinition) => EquipmentResult;
}

export interface LootDefinition {
  readonly id: string;
  readonly type: LootType;
  readonly rarity: Rarity;
  readonly label: string;
  readonly color: string;
  readonly canDrop?: (context: LootContext) => boolean;
  readonly apply: (context: LootContext, quantity: number) => string;
}

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

export interface CollectedLoot {
  readonly drop: LootDrop;
  readonly message: string;
}
