import { EQUIPMENT_DEFINITIONS } from './equipment';
import type { EquipmentDefinition } from '../types/equipment';
import {
  LootType,
  Rarity,
  type LootDefinition,
  type LootTableEntry,
} from '../types/loot';

const MINOR_POTION_HEALING = 25;

export const LOOT_PRESENTATION = {
  collectionTextDurationMs: 900,
} as const;

export const GOLD_COINS: LootDefinition = {
  id: 'gold-coins',
  type: LootType.Gold,
  rarity: Rarity.Common,
  label: 'Moedas antigas',
  color: '#f0cb6a',
  apply: ({ run }, quantity) => {
    run.gold += quantity;
    return `+${quantity} ouro`;
  },
};

export const MINOR_HEALING_POTION: LootDefinition = {
  id: 'minor-healing-potion',
  type: LootType.Potion,
  rarity: Rarity.Common,
  label: 'Poção menor de cura',
  color: '#7cdb8e',
  apply: ({ playerStats }, quantity) => {
    const previousHealth = playerStats.health;
    playerStats.health = Math.min(
      playerStats.maxHealth,
      playerStats.health + MINOR_POTION_HEALING * quantity,
    );
    const restoredHealth = playerStats.health - previousHealth;

    return `${MINOR_HEALING_POTION.label}: +${formatNumber(restoredHealth)} HP`;
  },
};

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
    loot: MINOR_HEALING_POTION,
    weight: 20,
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

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
