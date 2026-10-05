import type { ItemInstance } from './item';

export interface InventorySlotState {
  readonly item: ItemInstance;
  quantity: number;
}

export type QuickSlotState = [
  string | null,
  string | null,
  string | null,
];

export interface InventoryState {
  readonly slots: InventorySlotState[];
  readonly quickSlots: QuickSlotState;
  backpack: ItemInstance | null;
}
