import type { ItemRarity } from './item';

export enum ChestState {
  Closed = 'CLOSED',
  Open = 'OPEN',
}

export interface ChestDefinition {
  readonly rarity: ItemRarity;
  readonly label: string;
  readonly closedTextureKey: string;
  readonly openTextureKey: string;
  readonly bodyWidth: number;
  readonly bodyHeight: number;
}

export interface ChestSpawnDefinition {
  readonly rarity: ItemRarity;
  readonly x: number;
  readonly y: number;
}
