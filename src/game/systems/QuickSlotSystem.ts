import { getItemDefinition } from '../items/ItemRegistry';
import { CONSUMABLE_PRESENTATION } from '../config/consumables';
import type { Player } from '../player/Player';
import { ItemType } from '../types/item';
import { ConsumableSystem } from './ConsumableSystem';
import type { InventorySystem } from './InventorySystem';

export interface QuickSlotUseResult {
  readonly used: boolean;
  readonly message: string;
  readonly color: string;
}

export class QuickSlotSystem {
  private readonly consumables = new ConsumableSystem();

  constructor(
    private readonly inventory: InventorySystem,
    private readonly player: Player,
  ) {}

  use(index: number): QuickSlotUseResult | null {
    const definitionId = this.inventory.getQuickSlotDefinitionId(index);

    if (!definitionId) {
      return null;
    }

    return this.useConsumable(definitionId);
  }

  useConsumable(definitionId: string): QuickSlotUseResult | null {
    const definition = getItemDefinition(definitionId);

    if (
      !definition ||
      definition.type !== ItemType.Consumable ||
      this.inventory.getQuantity(definitionId) <= 0
    ) {
      return null;
    }

    const result = this.consumables.use(definition, this.player);

    if (result.consumed) {
      this.inventory.consumeOne(definitionId);
    }

    return {
      used: result.consumed,
      message: result.message,
      color: result.consumed
        ? definition.color
        : CONSUMABLE_PRESENTATION.fullHealthColor,
    };
  }
}
