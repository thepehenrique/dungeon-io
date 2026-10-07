import type { ItemRarity } from './item';

export enum ChestState {
  Closed = 'CLOSED',
  Open = 'OPEN',
}

export interface ChestDefinition {
  readonly rarity: ItemRarity;
  readonly label: string;
  readonly textureKey: string;
  readonly openAnimationKey: string;
  readonly closedFrame: string;
  readonly scale: number;
  readonly bodyWidth: number;
  readonly bodyHeight: number;
  readonly bodyOffsetX: number;
  readonly bodyOffsetY: number;
}

export interface ChestSpawnDefinition {
  readonly rarity: ItemRarity;
  readonly x: number;
  readonly y: number;
}
