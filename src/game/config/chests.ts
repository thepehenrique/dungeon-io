import type { ChestDefinition, ChestSpawnDefinition } from '../types/chest';
import { Rarity } from '../types/loot';

export const CHEST_DEFINITIONS: Readonly<
  Partial<Record<Rarity, ChestDefinition>>
> = {
  [Rarity.Common]: {
    rarity: Rarity.Common,
    label: 'Baú comum',
    closedTextureKey: 'chest-common-closed',
    openTextureKey: 'chest-common-open',
    bodyWidth: 46,
    bodyHeight: 34,
  },
};

export const INITIAL_CHEST_SPAWNS: readonly ChestSpawnDefinition[] = [
  { rarity: Rarity.Common, x: 1180, y: 400 },
] as const;
