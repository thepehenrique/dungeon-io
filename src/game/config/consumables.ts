import {
  ConsumableEffectType,
  ConsumableType,
  type ConsumableDefinition,
} from '../types/consumable';

export const CONSUMABLE_DEFINITIONS: Readonly<
  Record<ConsumableType, ConsumableDefinition>
> = {
  [ConsumableType.MinorHealthPotion]: {
    id: 'minor-health-potion',
    type: ConsumableType.MinorHealthPotion,
    label: 'Poção de Cura Menor',
    color: '#70dc91',
    textureKey: 'consumable-minor-health-potion',
    pickupRadius: 10,
    effect: {
      type: ConsumableEffectType.RestoreHealth,
      amount: 25,
    },
  },
  [ConsumableType.MajorHealthPotion]: {
    id: 'major-health-potion',
    type: ConsumableType.MajorHealthPotion,
    label: 'Poção de Cura Maior',
    color: '#ef657a',
    textureKey: 'consumable-major-health-potion',
    pickupRadius: 14,
    effect: {
      type: ConsumableEffectType.RestoreHealth,
      amount: 60,
    },
  },
};

export const CONSUMABLE_DROP_WEIGHTS: Readonly<Record<ConsumableType, number>> = {
  [ConsumableType.MinorHealthPotion]: 20,
  [ConsumableType.MajorHealthPotion]: 8,
};

export const CONSUMABLE_PRESENTATION = {
  chestDropOffsetX: 0,
  chestDropOffsetY: 48,
  fullHealthMessage: 'Vida já está cheia',
  fullHealthColor: '#c7d0db',
  slotOccupiedMessage: 'Slot de poção ocupado',
} as const;

export const POTION_SLOT_CONFIG = {
  maxQuantity: null as number | null,
} as const;
