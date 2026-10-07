import type { ChestDefinition, ChestSpawnDefinition } from '../types/chest';
import { ItemRarity } from '../types/item';

export const CHEST_DEFINITIONS: Readonly<
  Partial<Record<ItemRarity, ChestDefinition>>
> = {
  [ItemRarity.Common]: {
    rarity: ItemRarity.Common,
    label: 'Baú comum',
    textureKey: 'craftpix-chest-common',
    openAnimationKey: 'craftpix-chest-common-open',
    closedFrame: 'front-0',
    scale: 3,
    bodyWidth: 30,
    bodyHeight: 8,
    bodyOffsetX: 1,
    bodyOffsetY: 14,
  },
};

export const INITIAL_CHEST_SPAWNS: readonly ChestSpawnDefinition[] = [
  { rarity: ItemRarity.Common, x: 1180, y: 400 },
] as const;
