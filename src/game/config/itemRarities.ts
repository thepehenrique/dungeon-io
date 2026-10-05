import { ItemRarity } from '../types/item';

export interface ItemRarityPresentation {
  readonly label: string;
  readonly color: string;
}

export const ITEM_RARITY_PRESENTATION: Readonly<
  Record<ItemRarity, ItemRarityPresentation>
> = {
  [ItemRarity.Common]: {
    label: 'Comum',
    color: '#c7d0db',
  },
  [ItemRarity.Uncommon]: {
    label: 'Incomum',
    color: '#70dc91',
  },
  [ItemRarity.Rare]: {
    label: 'Raro',
    color: '#62a8e5',
  },
  [ItemRarity.Epic]: {
    label: 'Épico',
    color: '#b786e8',
  },
  [ItemRarity.Legendary]: {
    label: 'Lendário',
    color: '#f0a45d',
  },
};
