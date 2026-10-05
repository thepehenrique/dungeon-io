import { BASE_INVENTORY_CAPACITY } from './backpacks';
import type { InventoryState } from '../types/inventory';

export const INVENTORY_CONFIG = {
  initialCapacity: BASE_INVENTORY_CAPACITY,
  quickSlotCount: 3,
  fullMessage: 'Inventário cheio',
  fullHealthMessage: 'Vida cheia',
  betterBackpackMessage: 'Mochila atual é melhor',
} as const;

export function createInitialInventoryState(): InventoryState {
  return {
    slots: [],
    quickSlots: [null, null, null],
    backpack: null,
  };
}
