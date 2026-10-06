import { BACKPACK_DEFINITIONS } from './backpacks';
import { CONSUMABLE_DEFINITIONS } from './consumables';
import { EQUIPMENT_DEFINITIONS } from './equipment';
import { ConsumableType } from '../types/consumable';
import {
  DropTableId,
  type DropEntry,
  type DropTable,
} from '../types/drop';
import { ItemRarity } from '../types/item';

const ITEMS = {
  minorPotion: CONSUMABLE_DEFINITIONS[ConsumableType.MinorHealthPotion].id,
  majorPotion: CONSUMABLE_DEFINITIONS[ConsumableType.MajorHealthPotion].id,
  rustySword: EQUIPMENT_DEFINITIONS.rustySword.id,
  ironSword: EQUIPMENT_DEFINITIONS.ironSword.id,
  simpleBow: EQUIPMENT_DEFINITIONS.simpleBow.id,
  longBow: EQUIPMENT_DEFINITIONS.longBow.id,
  woodenStaff: EQUIPMENT_DEFINITIONS.woodenStaff.id,
  arcaneStaff: EQUIPMENT_DEFINITIONS.arcaneStaff.id,
  leatherArmor: EQUIPMENT_DEFINITIONS.leatherArmor.id,
  smallBackpack: BACKPACK_DEFINITIONS.small.id,
  mediumBackpack: BACKPACK_DEFINITIONS.medium.id,
  largeBackpack: BACKPACK_DEFINITIONS.large.id,
} as const;

const entry = (
  itemId: string,
  weight: number,
  minimumQuantity = 1,
  maximumQuantity = minimumQuantity,
): DropEntry => ({ itemId, weight, minimumQuantity, maximumQuantity });

export const DROP_TABLES: Readonly<Record<DropTableId, DropTable>> = {
  [DropTableId.Goblin]: {
    id: DropTableId.Goblin,
    itemDropChance: 0.3,
    gold: { chance: 0.55, minimumQuantity: 1, maximumQuantity: 4 },
    entries: [
      entry(ITEMS.minorPotion, 40),
      entry(ITEMS.rustySword, 22),
      entry(ITEMS.simpleBow, 22),
      entry(ITEMS.woodenStaff, 22),
      entry(ITEMS.leatherArmor, 18),
      entry(ITEMS.ironSword, 5),
      entry(ITEMS.longBow, 5),
      entry(ITEMS.arcaneStaff, 5),
    ],
  },
  [DropTableId.SkeletonWarrior]: {
    id: DropTableId.SkeletonWarrior,
    itemDropChance: 0.35,
    gold: { chance: 0.6, minimumQuantity: 2, maximumQuantity: 5 },
    entries: [
      entry(ITEMS.minorPotion, 30),
      entry(ITEMS.rustySword, 28),
      entry(ITEMS.simpleBow, 28),
      entry(ITEMS.woodenStaff, 28),
      entry(ITEMS.leatherArmor, 14),
      entry(ITEMS.ironSword, 10),
      entry(ITEMS.longBow, 10),
      entry(ITEMS.arcaneStaff, 10),
    ],
  },
  [DropTableId.Zombie]: {
    id: DropTableId.Zombie,
    itemDropChance: 0.3,
    gold: { chance: 0.65, minimumQuantity: 2, maximumQuantity: 6 },
    entries: [
      entry(ITEMS.minorPotion, 45),
      entry(ITEMS.majorPotion, 6),
      entry(ITEMS.leatherArmor, 30),
    ],
  },
  [DropTableId.CommonChest]: {
    id: DropTableId.CommonChest,
    itemDropChance: 1,
    gold: { chance: 1, minimumQuantity: 15, maximumQuantity: 30 },
    entries: [
      entry(ITEMS.minorPotion, 24),
      entry(ITEMS.majorPotion, 12),
      entry(ITEMS.rustySword, 20),
      entry(ITEMS.simpleBow, 20),
      entry(ITEMS.woodenStaff, 20),
      entry(ITEMS.leatherArmor, 20),
      entry(ITEMS.ironSword, 10),
      entry(ITEMS.longBow, 10),
      entry(ITEMS.arcaneStaff, 10),
      entry(ITEMS.smallBackpack, 3),
      entry(ITEMS.mediumBackpack, 2),
      entry(ITEMS.largeBackpack, 1),
    ],
  },
};

export const CHEST_DROP_TABLES: Readonly<
  Partial<Record<ItemRarity, DropTableId>>
> = {
  [ItemRarity.Common]: DropTableId.CommonChest,
};

export const DROP_CONFIG = {
  interactionRange: 60,
  spawnOffsetMinimum: 10,
  spawnOffsetMaximum: 22,
  chestSpawnOffsetY: 40,
  spawnAttempts: 8,
  wallPadding: 8,
  promptOffsetY: 34,
  goldPickupRadius: 12,
  goldColor: '#f0cb6a',
  feedbackDurationMs: 900,
} as const;

export const WORLD_ITEM_TEXTURE_KEYS = {
  equipment: 'world-item-equipment',
  consumable: 'world-item-consumable',
  backpack: 'world-item-backpack',
  gold: 'world-item-gold',
} as const;
