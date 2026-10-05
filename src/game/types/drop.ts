import type { PlayerClass } from './player';

export enum DropTableId {
  Goblin = 'GOBLIN',
  SkeletonWarrior = 'SKELETON_WARRIOR',
  Zombie = 'ZOMBIE',
  CommonChest = 'COMMON_CHEST',
}

export interface DropEntry {
  readonly itemId: string;
  readonly weight: number;
  readonly minimumQuantity: number;
  readonly maximumQuantity: number;
}

export interface GoldDropDefinition {
  readonly chance: number;
  readonly minimumQuantity: number;
  readonly maximumQuantity: number;
}

export interface DropTable {
  readonly id: DropTableId;
  readonly itemDropChance: number;
  readonly entries: readonly DropEntry[];
  readonly gold?: GoldDropDefinition;
}

export interface ItemDropResult {
  readonly type: 'ITEM';
  readonly definitionId: string;
  readonly quantity: number;
}

export interface GoldDropResult {
  readonly type: 'GOLD';
  readonly quantity: number;
}

export type DropResult = ItemDropResult | GoldDropResult;

export interface DropContext {
  readonly playerClass: PlayerClass;
}
