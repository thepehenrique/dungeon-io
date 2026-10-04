import { COMMON_CHEST_LOOT_TABLE } from '../config/loot';
import {
  Rarity,
  type CollectedLoot,
  type LootContext,
  type LootDrop,
  type LootTableEntry,
} from '../types/loot';

export class LootSystem {
  private readonly random: () => number;

  constructor(random: () => number = Math.random) {
    this.random = random;
  }

  collectChestLoot(rarity: Rarity, context: LootContext): CollectedLoot {
    const eligibleTable = this.getChestLootTable(rarity).filter(
      (entry) => !entry.loot.canDrop || entry.loot.canDrop(context),
    );
    const drop = this.roll(eligibleTable);

    return {
      drop,
      message: drop.definition.apply(context, drop.quantity),
    };
  }

  private roll(table: readonly LootTableEntry[]): LootDrop {
    if (table.length === 0) {
      throw new Error('Cannot roll an empty loot table.');
    }

    const totalWeight = table.reduce(
      (total, entry) => total + Math.max(0, entry.weight),
      0,
    );

    if (totalWeight <= 0) {
      throw new Error('Loot table must contain a positive weight.');
    }

    let roll = this.random() * totalWeight;
    let selectedEntry = table[table.length - 1];

    for (const entry of table) {
      roll -= Math.max(0, entry.weight);

      if (roll < 0) {
        selectedEntry = entry;
        break;
      }
    }

    const quantityRange =
      selectedEntry.maximumQuantity - selectedEntry.minimumQuantity + 1;
    const quantity =
      selectedEntry.minimumQuantity + Math.floor(this.random() * quantityRange);

    return {
      definition: selectedEntry.loot,
      quantity,
    };
  }

  private getChestLootTable(rarity: Rarity): readonly LootTableEntry[] {
    switch (rarity) {
      case Rarity.Common:
        return COMMON_CHEST_LOOT_TABLE;
      case Rarity.Rare:
      case Rarity.Epic:
      case Rarity.Legendary:
        throw new Error(`Loot table not implemented for rarity: ${rarity}`);
    }
  }
}
