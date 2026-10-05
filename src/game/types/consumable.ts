import type { ConsumableType } from './item';

export { ConsumableEffectType, ConsumableType } from './item';
export type {
  ConsumableDefinition,
  ConsumableEffect,
  HealEffect,
} from './item';

export interface ConsumableUseResult {
  readonly consumed: boolean;
  readonly appliedAmount: number;
  readonly message: string;
}

export interface PotionSlotState {
  type: ConsumableType | null;
  quantity: number;
}
