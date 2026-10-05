import { getItemDefinition } from '../items/ItemRegistry';
import {
  type DropContext,
  type DropEntry,
  type DropResult,
  type DropTable,
} from '../types/drop';
import { ItemType } from '../types/item';

export function rollDropTable(
  table: DropTable,
  context: DropContext,
  random: () => number = Math.random,
): readonly DropResult[] {
  const results: DropResult[] = [];

  if (table.gold && random() < table.gold.chance) {
    results.push({
      type: 'GOLD',
      quantity: rollQuantity(
        table.gold.minimumQuantity,
        table.gold.maximumQuantity,
        random,
      ),
    });
  }

  if (random() >= table.itemDropChance) {
    return results;
  }

  const eligibleEntries = table.entries.filter((entry) =>
    canDropForClass(entry, context),
  );

  if (eligibleEntries.length === 0) {
    return results;
  }

  const selected = pickWeightedEntry(eligibleEntries, random);
  results.push({
    type: 'ITEM',
    definitionId: selected.itemId,
    quantity: rollQuantity(
      selected.minimumQuantity,
      selected.maximumQuantity,
      random,
    ),
  });
  return results;
}

export function pickWeightedEntry(
  entries: readonly DropEntry[],
  random: () => number = Math.random,
): DropEntry {
  if (entries.length === 0) {
    throw new Error('Cannot pick from an empty drop table.');
  }

  const totalWeight = entries.reduce(
    (total, entry) => total + Math.max(0, entry.weight),
    0,
  );

  if (totalWeight <= 0) {
    throw new Error('Drop table must contain a positive weight.');
  }

  let roll = random() * totalWeight;

  for (const entry of entries) {
    roll -= Math.max(0, entry.weight);

    if (roll < 0) {
      return entry;
    }
  }

  return entries[entries.length - 1];
}

function canDropForClass(entry: DropEntry, context: DropContext): boolean {
  const definition = getItemDefinition(entry.itemId);

  if (!definition) {
    throw new Error(`Drop table references unknown item: ${entry.itemId}`);
  }

  return (
    definition.type !== ItemType.Equipment ||
    definition.allowedClasses.includes(context.playerClass)
  );
}

function rollQuantity(
  minimum: number,
  maximum: number,
  random: () => number,
): number {
  const safeMinimum = Math.max(0, Math.floor(Math.min(minimum, maximum)));
  const safeMaximum = Math.max(
    safeMinimum,
    Math.floor(Math.max(minimum, maximum)),
  );

  return safeMinimum + Math.floor(random() * (safeMaximum - safeMinimum + 1));
}
