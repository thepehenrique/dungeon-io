import type { Player } from '../player/Player';
import {
  EquipmentSlot,
  ItemStat,
  ItemType,
  ModifierMode,
  type EquipmentDefinition,
  type ItemInstance,
  type ItemModifier,
} from '../types/item';
import type {
  InventoryOperationResult,
  InventorySystem,
} from './InventorySystem';

interface AppliedModifier {
  readonly stat: ItemStat;
  readonly delta: number;
}

interface EquippedItem {
  readonly instance: ItemInstance;
  readonly definition: EquipmentDefinition;
  appliedModifiers: readonly AppliedModifier[];
}

export interface EquippedItemView {
  readonly instance: ItemInstance;
  readonly definition: EquipmentDefinition;
}

export class EquipmentSystem {
  private readonly equippedItems = new Map<EquipmentSlot, EquippedItem>();
  private changeRevision = 0;

  constructor(
    private readonly player: Player,
    private readonly inventory: InventorySystem,
  ) {}

  get revision(): number {
    return this.changeRevision;
  }

  canEquip(equipment: EquipmentDefinition): boolean {
    return equipment.allowedClasses.includes(this.player.playerClass);
  }

  equipFromInventory(index: number): InventoryOperationResult {
    const inventorySlot = this.inventory.getSlot(index);

    if (!inventorySlot) {
      return { success: false, message: 'Item não encontrado' };
    }

    const definition = this.inventory.getDefinition(inventorySlot);

    if (definition.type !== ItemType.Equipment) {
      return { success: false, message: 'Item não é equipamento' };
    }

    if (!this.canEquip(definition)) {
      return {
        success: false,
        message: `${this.player.playerClass} não pode equipar ${definition.name}`,
      };
    }

    const previous = this.equippedItems.get(definition.slot) ?? null;
    const selected = this.inventory.removeSlot(index);

    if (!selected) {
      return { success: false, message: 'Item não encontrado' };
    }

    if (previous) {
      this.removeModifiers(previous.appliedModifiers);
      const restored = this.inventory.restoreSlot({
        item: previous.instance,
        quantity: 1,
      });

      if (!restored) {
        this.inventory.restoreSlot(selected);
        previous.appliedModifiers = this.applyModifiers(
          previous.definition.modifiers,
          true,
        );
        return { success: false, message: 'Falha ao trocar equipamento' };
      }
    }

    const appliedModifiers = this.applyModifiers(definition.modifiers, true);
    this.equippedItems.set(definition.slot, {
      instance: selected.item,
      definition,
      appliedModifiers,
    });
    this.changeRevision += 1;
    return { success: true, message: `${definition.name} equipado` };
  }

  unequip(slot: EquipmentSlot): InventoryOperationResult {
    const equipped = this.equippedItems.get(slot);

    if (!equipped) {
      return { success: false, message: 'Slot já está vazio' };
    }

    if (!this.inventory.hasFreeSlot()) {
      return { success: false, message: 'Inventário cheio' };
    }

    this.removeModifiers(equipped.appliedModifiers);
    this.inventory.restoreSlot({ item: equipped.instance, quantity: 1 });
    this.equippedItems.delete(slot);
    this.changeRevision += 1;
    return { success: true, message: `${equipped.definition.name} desequipado` };
  }

  getEquipped(slot: EquipmentSlot): EquippedItemView | null {
    const equipped = this.equippedItems.get(slot);

    return equipped
      ? { instance: equipped.instance, definition: equipped.definition }
      : null;
  }

  getEquippedItems(): readonly EquippedItemView[] {
    return [...this.equippedItems.values()].map((item) => ({
      instance: item.instance,
      definition: item.definition,
    }));
  }

  applyStatChange(change: () => void): void {
    const originalHealth = this.player.stats.health;
    const equipped = [...this.equippedItems.values()];

    for (const item of equipped) {
      this.removeModifiers(item.appliedModifiers, false);
    }

    this.player.stats.health = Math.min(
      this.player.stats.health,
      this.player.stats.maxHealth,
    );
    const healthBeforeChange = this.player.stats.health;
    change();
    const healthChange = this.player.stats.health - healthBeforeChange;

    for (const item of equipped) {
      item.appliedModifiers = this.applyModifiers(
        item.definition.modifiers,
        false,
      );
    }

    this.player.stats.health = clamp(
      originalHealth + healthChange,
      0,
      this.player.stats.maxHealth,
    );
  }

  private applyModifiers(
    modifiers: readonly ItemModifier[],
    increaseHealth: boolean,
  ): readonly AppliedModifier[] {
    return modifiers.map((modifier) =>
      this.applyModifier(modifier, increaseHealth),
    );
  }

  private applyModifier(
    modifier: ItemModifier,
    increaseHealth: boolean,
  ): AppliedModifier {
    const currentValue = this.player.stats[modifier.stat];
    const rawDelta =
      modifier.mode === ModifierMode.Flat
        ? modifier.value
        : currentValue * modifier.value;
    const delta = roundStat(rawDelta);

    this.player.stats[modifier.stat] = roundStat(currentValue + delta);

    if (
      increaseHealth &&
      modifier.stat === ItemStat.MaxHealth &&
      delta > 0
    ) {
      this.player.stats.health = Math.min(
        this.player.stats.maxHealth,
        this.player.stats.health + delta,
      );
    }

    return { stat: modifier.stat, delta };
  }

  private removeModifiers(
    modifiers: readonly AppliedModifier[],
    clampHealth = true,
  ): void {
    for (const modifier of modifiers) {
      this.player.stats[modifier.stat] = roundStat(
        this.player.stats[modifier.stat] - modifier.delta,
      );
    }

    if (clampHealth) {
      this.player.stats.health = Math.min(
        this.player.stats.health,
        this.player.stats.maxHealth,
      );
    }
  }
}

function roundStat(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
