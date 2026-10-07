import {
  ConsumableEffectType,
  ConsumableType,
  ItemRarity,
  ItemType,
  type ConsumableDefinition,
} from '../types/item';

export const CONSUMABLE_DEFINITIONS: Readonly<
  Record<ConsumableType, ConsumableDefinition>
> = {
  [ConsumableType.MinorHealthPotion]: {
    id: 'minor_health_potion',
    name: 'Poção de Cura Menor',
    type: ItemType.Consumable,
    rarity: ItemRarity.Common,
    consumableType: ConsumableType.MinorHealthPotion,
    color: '#70dc91',
    textureKey: 'consumable-minor-health-potion',
    assetPath: 'assets/items/potions/minor-health-potion.png',
    pickupRadius: 10,
    stackLimit: 5,
    effect: {
      type: ConsumableEffectType.Heal,
      amount: 25,
    },
  },
  [ConsumableType.MajorHealthPotion]: {
    id: 'major_health_potion',
    name: 'Poção de Cura Maior',
    type: ItemType.Consumable,
    rarity: ItemRarity.Uncommon,
    consumableType: ConsumableType.MajorHealthPotion,
    color: '#ef657a',
    textureKey: 'consumable-major-health-potion',
    assetPath: 'assets/items/potions/major-health-potion.png',
    pickupRadius: 14,
    stackLimit: 3,
    effect: {
      type: ConsumableEffectType.Heal,
      amount: 60,
    },
  },
};

export const CONSUMABLE_PRESENTATION = {
  fullHealthMessage: 'Vida já está cheia',
  fullHealthColor: '#c7d0db',
} as const;
