import { BACKPACK_DEFINITIONS } from '../config/backpacks';
import { CONSUMABLE_DEFINITIONS } from '../config/consumables';
import { EQUIPMENT_DEFINITIONS } from '../config/equipment';
import {
  ItemType,
  type RegisteredItemDefinition,
} from '../types/item';

export const ITEM_DEFINITION_LIST: readonly RegisteredItemDefinition[] =
  Object.freeze([
    ...Object.values(EQUIPMENT_DEFINITIONS),
    ...Object.values(CONSUMABLE_DEFINITIONS),
    ...Object.values(BACKPACK_DEFINITIONS),
  ]);

export const ITEM_DEFINITIONS: Readonly<
  Record<string, RegisteredItemDefinition>
> = createItemRegistry(ITEM_DEFINITION_LIST);

export function getItemDefinition(
  id: string,
): RegisteredItemDefinition | undefined {
  return ITEM_DEFINITIONS[id];
}

function createItemRegistry(
  definitions: readonly RegisteredItemDefinition[],
): Readonly<Record<string, RegisteredItemDefinition>> {
  const registry: Record<string, RegisteredItemDefinition> = {};

  for (const definition of definitions) {
    if (Object.hasOwn(registry, definition.id)) {
      throw new Error(`Duplicate item definition id: ${definition.id}`);
    }

    freezeDefinition(definition);
    registry[definition.id] = definition;
  }

  return Object.freeze(registry);
}

function freezeDefinition(definition: RegisteredItemDefinition): void {
  switch (definition.type) {
    case ItemType.Equipment:
      Object.freeze(definition.allowedClasses);
      for (const modifier of definition.modifiers) {
        Object.freeze(modifier);
      }
      Object.freeze(definition.modifiers);
      break;
    case ItemType.Consumable:
      Object.freeze(definition.effect);
      break;
    case ItemType.Backpack:
      break;
  }

  Object.freeze(definition);
}
