import type { ChestDefinition, ChestSpawnDefinition } from '../types/chest';
import { ItemRarity } from '../types/item';

export const CHEST_DEFINITIONS: Readonly<
  Partial<Record<ItemRarity, ChestDefinition>>
> = {
  [ItemRarity.Common]: {
    rarity: ItemRarity.Common,
    label: 'Baú comum',
    closedTextureKey: 'chest-common-closed',
    openTextureKey: 'chest-common-open',
    bodyWidth: 46,
    bodyHeight: 34,
  },
};

export const INITIAL_CHEST_SPAWNS: readonly ChestSpawnDefinition[] = [
  { rarity: ItemRarity.Common, x: 1180, y: 400 },
] as const;
