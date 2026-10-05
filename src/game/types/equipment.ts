import type { EquipmentDefinition } from './item';

export {
  EquipmentKind,
  EquipmentSlot,
  ItemStat,
  ModifierMode,
} from './item';
export type { EquipmentDefinition, ItemModifier } from './item';

export interface EquipmentResult {
  readonly equipped: EquipmentDefinition;
  readonly replaced: EquipmentDefinition | null;
}
