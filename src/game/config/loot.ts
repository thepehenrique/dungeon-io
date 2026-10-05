import {
  CONSUMABLE_DEFINITIONS,
  CONSUMABLE_DROP_WEIGHTS,
} from './consumables';
import { EQUIPMENT_DEFINITIONS } from './equipment';
import type { EquipmentDefinition } from '../types/equipment';
import {
  LootDelivery,
  LootType,
  Rarity,
  type LootDefinition,
  type LootTableEntry,
} from '../types/loot';
import { ConsumableType } from '../types/consumable';

export const LOOT_PRESENTATION = {
  collectionTextDurationMs: 900,
} as const;

export const GOLD_COINS: LootDefinition = {
  id: 'gold-coins',
  type: LootType.Gold,
  delivery: LootDelivery.Immediate,
  rarity: Rarity.Common,
  label: 'Moedas antigas',
  color: '#f0cb6a',
  apply: ({ run }, quantity) => {
    run.gold += quantity;
    return `+${quantity} ouro`;
  },
};

export const MINOR_HEALTH_POTION_LOOT = createConsumableLoot(
  ConsumableType.MinorHealthPotion,
);
export const MAJOR_HEALTH_POTION_LOOT = createConsumableLoot(
  ConsumableType.MajorHealthPotion,
);

const LEATHER_ARMOR_LOOT = createEquipmentLoot(
  EQUIPMENT_DEFINITIONS.leatherArmor,
);
const IRON_SWORD_LOOT = createEquipmentLoot(EQUIPMENT_DEFINITIONS.ironSword);
const HUNTING_BOW_LOOT = createEquipmentLoot(EQUIPMENT_DEFINITIONS.huntingBow);
const APPRENTICE_STAFF_LOOT = createEquipmentLoot(
  EQUIPMENT_DEFINITIONS.apprenticeStaff,
);

export const COMMON_CHEST_LOOT_TABLE: readonly LootTableEntry[] = [
  {
    loot: GOLD_COINS,
    weight: 45,
    minimumQuantity: 15,
    maximumQuantity: 30,
  },
  {
    loot: MINOR_HEALTH_POTION_LOOT,
    weight: CONSUMABLE_DROP_WEIGHTS[ConsumableType.MinorHealthPotion],
    minimumQuantity: 1,
    maximumQuantity: 1,
  },
  {
    loot: MAJOR_HEALTH_POTION_LOOT,
    weight: CONSUMABLE_DROP_WEIGHTS[ConsumableType.MajorHealthPotion],
    minimumQuantity: 1,
    maximumQuantity: 1,
  },
  {
    loot: LEATHER_ARMOR_LOOT,
    weight: 15,
    minimumQuantity: 1,
    maximumQuantity: 1,
  },
  {
    loot: IRON_SWORD_LOOT,
    weight: 20,
    minimumQuantity: 1,
    maximumQuantity: 1,
  },
  {
    loot: HUNTING_BOW_LOOT,
    weight: 20,
    minimumQuantity: 1,
    maximumQuantity: 1,
  },
  {
    loot: APPRENTICE_STAFF_LOOT,
    weight: 20,
    minimumQuantity: 1,
    maximumQuantity: 1,
  },
] as const;

function createEquipmentLoot(equipment: EquipmentDefinition): LootDefinition {
  return {
    id: `equipment-${equipment.id}`,
    type: LootType.Equipment,
    delivery: LootDelivery.Immediate,
    rarity: equipment.rarity,
    label: equipment.label,
    color: '#79b8ed',
    canDrop: ({ playerClass }) =>
      equipment.allowedClasses.includes(playerClass),
    apply: ({ equipEquipment }) => {
      const result = equipEquipment(equipment);

      return result.replaced
        ? `Equipado: ${equipment.label} (substituiu ${result.replaced.label})`
        : `Equipado: ${equipment.label}`;
    },
  };
}

function createConsumableLoot(type: ConsumableType): LootDefinition {
  const consumable = CONSUMABLE_DEFINITIONS[type];

  return {
    id: `consumable-${consumable.id}`,
    type: LootType.Consumable,
    delivery: LootDelivery.Pickup,
    rarity: Rarity.Common,
    label: consumable.label,
    color: consumable.color,
    consumableType: type,
  };
}
