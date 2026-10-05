import {
  CONSUMABLE_DEFINITIONS,
  CONSUMABLE_PRESENTATION,
  POTION_SLOT_CONFIG,
} from '../../config/consumables';
import type { Player } from '../../player/Player';
import { ConsumableSystem } from '../../systems/ConsumableSystem';
import type {
  ConsumableDefinition,
  ConsumableType,
  ConsumableUseResult,
  PotionSlotState,
} from '../../types/consumable';

export interface PotionStoreResult {
  readonly stored: boolean;
  readonly message: string;
}

export interface PotionUseResult extends ConsumableUseResult {
  readonly definition: ConsumableDefinition;
}

export class PotionSlot {
  private readonly consumableSystem = new ConsumableSystem();

  constructor(private readonly state: PotionSlotState) {}

  get type(): ConsumableType | null {
    return this.state.type;
  }

  get quantity(): number {
    return this.state.quantity;
  }

  add(type: ConsumableType): PotionStoreResult {
    const definition = CONSUMABLE_DEFINITIONS[type];

    if (this.state.type !== null && this.state.type !== type) {
      return {
        stored: false,
        message: CONSUMABLE_PRESENTATION.slotOccupiedMessage,
      };
    }

    if (
      POTION_SLOT_CONFIG.maxQuantity !== null &&
      this.state.quantity >= POTION_SLOT_CONFIG.maxQuantity
    ) {
      return {
        stored: false,
        message: CONSUMABLE_PRESENTATION.slotOccupiedMessage,
      };
    }

    this.state.type = type;
    this.state.quantity += 1;

    return {
      stored: true,
      message: `${definition.label} coletada`,
    };
  }

  use(player: Player): PotionUseResult | null {
    const type = this.state.type;

    if (type === null || this.state.quantity <= 0) {
      this.clear();
      return null;
    }

    const definition = CONSUMABLE_DEFINITIONS[type];
    const result = this.consumableSystem.use(definition, player);

    if (result.consumed) {
      this.state.quantity -= 1;

      if (this.state.quantity === 0) {
        this.clear();
      }
    }

    return {
      ...result,
      definition,
    };
  }

  private clear(): void {
    this.state.type = null;
    this.state.quantity = 0;
  }
}
