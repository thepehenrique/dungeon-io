import { CONSUMABLE_PRESENTATION } from '../config/consumables';
import type { Player } from '../player/Player';
import {
  ConsumableEffectType,
  type ConsumableDefinition,
  type ConsumableUseResult,
} from '../types/consumable';

export class ConsumableSystem {
  use(definition: ConsumableDefinition, player: Player): ConsumableUseResult {
    switch (definition.effect.type) {
      case ConsumableEffectType.RestoreHealth: {
        const appliedAmount = player.heal(definition.effect.amount);

        if (appliedAmount <= 0) {
          return {
            consumed: false,
            appliedAmount: 0,
            message: CONSUMABLE_PRESENTATION.fullHealthMessage,
          };
        }

        return {
          consumed: true,
          appliedAmount,
          message: `${definition.label} +${formatNumber(appliedAmount)} HP`,
        };
      }
    }
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
