import type { Rarity } from './loot';

export enum ChestState {
  Closed = 'CLOSED',
  Open = 'OPEN',
}

export interface ChestDefinition {
  readonly rarity: Rarity;
  readonly label: string;
  readonly closedTextureKey: string;
  readonly openTextureKey: string;
  readonly bodyWidth: number;
  readonly bodyHeight: number;
}

export interface ChestSpawnDefinition {
  readonly rarity: Rarity;
  readonly x: number;
  readonly y: number;
}
