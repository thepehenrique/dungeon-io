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
