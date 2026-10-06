import { BASE_INVENTORY_CAPACITY } from '../config/backpacks';
import { INVENTORY_CONFIG } from '../config/inventory';
import { getItemDefinition } from '../items/ItemRegistry';
import {
  ItemType,
  type BackpackDefinition,
  type ConsumableDefinition,
  type ItemInstance,
  type RegisteredItemDefinition,
} from '../types/item';
import type {
  InventorySlotState,
  InventoryState,
} from '../types/inventory';

export interface InventoryOperationResult {
  readonly success: boolean;
  readonly message: string;
}

export interface BackpackEquipResult extends InventoryOperationResult {
  readonly replaced: ItemInstance | null;
}

export class InventorySystem {
  private changeRevision = 0;

  constructor(private readonly state: InventoryState) {}

  get capacity(): number {
    const backpack = this.getBackpackDefinition();
    return backpack?.capacity ?? BASE_INVENTORY_CAPACITY;
  }

  get usedSlots(): number {
    return this.state.slots.length;
  }

  get revision(): number {
    return this.changeRevision;
  }

  get slots(): readonly InventorySlotState[] {
    return this.state.slots;
  }

  get backpack(): ItemInstance | null {
    return this.state.backpack;
  }

  getSlot(index: number): InventorySlotState | null {
    return this.state.slots[index] ?? null;
  }

  getDefinition(slot: InventorySlotState): RegisteredItemDefinition {
    const definition = getItemDefinition(slot.item.definitionId);

    if (!definition) {
      throw new Error(`Unknown inventory item: ${slot.item.definitionId}`);
    }

    return definition;
  }

  addItem(instance: ItemInstance, quantity: number): InventoryOperationResult {
    const definition = getItemDefinition(instance.definitionId);

    if (!definition || quantity <= 0) {
      return { success: false, message: 'Item inválido' };
    }

    if (definition.type === ItemType.Backpack) {
      return { success: false, message: 'Mochila deve ser equipada' };
    }

    if (definition.type === ItemType.Equipment) {
      if (quantity !== 1 || this.usedSlots >= this.capacity) {
        return { success: false, message: INVENTORY_CONFIG.fullMessage };
      }

      this.state.slots.push({ item: { ...instance }, quantity: 1 });
      this.markChanged();
      return { success: true, message: `${definition.name} coletado` };
    }

    return this.addConsumable(instance, definition, quantity);
  }

  removeSlot(index: number): InventorySlotState | null {
    if (index < 0 || index >= this.state.slots.length) {
      return null;
    }

    const [removed] = this.state.slots.splice(index, 1);
    this.clearMissingQuickSlots();
    this.markChanged();
    return removed ?? null;
  }

  restoreSlot(slot: InventorySlotState): boolean {
    if (this.usedSlots >= this.capacity) {
      return false;
    }

    this.state.slots.push({
      item: { ...slot.item },
      quantity: slot.quantity,
    });
    this.markChanged();
    return true;
  }

  hasFreeSlot(): boolean {
    return this.usedSlots < this.capacity;
  }

  getQuantity(definitionId: string): number {
    return this.state.slots.reduce(
      (total, slot) =>
        slot.item.definitionId === definitionId
          ? total + slot.quantity
          : total,
      0,
    );
  }

  consumeOne(definitionId: string): boolean {
    const index = this.state.slots.findIndex(
      (slot) => slot.item.definitionId === definitionId && slot.quantity > 0,
    );

    if (index < 0) {
      this.clearQuickSlotDefinition(definitionId);
      return false;
    }

    const slot = this.state.slots[index];
    slot.quantity -= 1;

    if (slot.quantity === 0) {
      this.state.slots.splice(index, 1);
    }

    this.clearMissingQuickSlots();
    this.markChanged();
    return true;
  }

  assignQuickSlot(index: number, definitionId: string): InventoryOperationResult {
    const definition = getItemDefinition(definitionId);

    if (
      index < 0 ||
      index >= INVENTORY_CONFIG.quickSlotCount ||
      !definition ||
      definition.type !== ItemType.Consumable ||
      this.getQuantity(definitionId) <= 0
    ) {
      return { success: false, message: 'Consumível indisponível' };
    }

    this.clearQuickSlotDefinition(definitionId);
    this.state.quickSlots[index] = definitionId;
    this.markChanged();
    return { success: true, message: `${definition.name} no slot ${index + 1}` };
  }

  getQuickSlotDefinitionId(index: number): string | null {
    return this.state.quickSlots[index] ?? null;
  }

  clearQuickSlot(index: number): InventoryOperationResult {
    if (index < 0 || index >= INVENTORY_CONFIG.quickSlotCount) {
      return { success: false, message: 'Quick Slot inválido' };
    }

    if (this.state.quickSlots[index] === null) {
      return { success: false, message: `Slot ${index + 1} já está vazio` };
    }

    this.state.quickSlots[index] = null;
    this.markChanged();
    return {
      success: true,
      message: `Item removido do slot ${index + 1}`,
    };
  }

  equipBackpack(
    instance: ItemInstance,
    definition: BackpackDefinition,
  ): BackpackEquipResult {
    const current = this.getBackpackDefinition();

    if (current && definition.capacity <= current.capacity) {
      return {
        success: false,
        message: INVENTORY_CONFIG.betterBackpackMessage,
        replaced: null,
      };
    }

    if (this.usedSlots > definition.capacity) {
      return {
        success: false,
        message: INVENTORY_CONFIG.fullMessage,
        replaced: null,
      };
    }

    const replaced = this.state.backpack;
    this.state.backpack = { ...instance };
    this.markChanged();
    return {
      success: true,
      message: `${definition.name} equipada`,
      replaced,
    };
  }

  private addConsumable(
    instance: ItemInstance,
    definition: ConsumableDefinition,
    quantity: number,
  ): InventoryOperationResult {
    const existingSpace = this.state.slots.reduce((space, slot) => {
      if (slot.item.definitionId !== definition.id) {
        return space;
      }

      return space + Math.max(0, definition.stackLimit - slot.quantity);
    }, 0);
    const emptySlots = this.capacity - this.usedSlots;
    const totalSpace = existingSpace + emptySlots * definition.stackLimit;

    if (totalSpace < quantity) {
      return { success: false, message: INVENTORY_CONFIG.fullMessage };
    }

    let remaining = quantity;

    for (const slot of this.state.slots) {
      if (slot.item.definitionId !== definition.id || remaining === 0) {
        continue;
      }

      const added = Math.min(definition.stackLimit - slot.quantity, remaining);
      slot.quantity += added;
      remaining -= added;
    }

    let usesOriginalInstance = true;

    while (remaining > 0) {
      const stackQuantity = Math.min(definition.stackLimit, remaining);
      this.state.slots.push({
        item: usesOriginalInstance
          ? { ...instance }
          : { instanceId: crypto.randomUUID(), definitionId: definition.id },
        quantity: stackQuantity,
      });
      usesOriginalInstance = false;
      remaining -= stackQuantity;
    }

    this.markChanged();
    return {
      success: true,
      message: `${definition.name} x${quantity} coletada`,
    };
  }

  private getBackpackDefinition(): BackpackDefinition | null {
    const instance = this.state.backpack;

    if (!instance) {
      return null;
    }

    const definition = getItemDefinition(instance.definitionId);
    return definition?.type === ItemType.Backpack ? definition : null;
  }

  private clearMissingQuickSlots(): void {
    for (const definitionId of this.state.quickSlots) {
      if (definitionId && this.getQuantity(definitionId) === 0) {
        this.clearQuickSlotDefinition(definitionId);
      }
    }
  }

  private clearQuickSlotDefinition(definitionId: string): void {
    for (let index = 0; index < this.state.quickSlots.length; index += 1) {
      if (this.state.quickSlots[index] === definitionId) {
        this.state.quickSlots[index] = null;
      }
    }
  }

  private markChanged(): void {
    this.changeRevision += 1;
  }
}
