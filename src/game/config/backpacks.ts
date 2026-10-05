import {
  BackpackKind,
  ItemRarity,
  ItemType,
  type BackpackDefinition,
} from '../types/item';

export const BASE_INVENTORY_CAPACITY = 3;

export const BACKPACK_DEFINITIONS = {
  small: {
    id: 'small_backpack',
    name: 'Mochila Pequena',
    description: 'Aumenta a capacidade futura do inventário para 6 slots.',
    type: ItemType.Backpack,
    rarity: ItemRarity.Common,
    backpackKind: BackpackKind.Small,
    capacity: 6,
  },
  medium: {
    id: 'medium_backpack',
    name: 'Mochila Média',
    description: 'Aumenta a capacidade futura do inventário para 9 slots.',
    type: ItemType.Backpack,
    rarity: ItemRarity.Uncommon,
    backpackKind: BackpackKind.Medium,
    capacity: 9,
  },
  large: {
    id: 'large_backpack',
    name: 'Mochila Grande',
    description: 'Aumenta a capacidade futura do inventário para 12 slots.',
    type: ItemType.Backpack,
    rarity: ItemRarity.Rare,
    backpackKind: BackpackKind.Large,
    capacity: 12,
  },
} as const satisfies Record<string, BackpackDefinition>;
