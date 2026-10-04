import type { Player } from '../player/Player';
import {
  ModifierMode,
  type EquipmentDefinition,
  type EquipmentModifier,
  type EquipmentResult,
  type EquipmentSlot,
  type EquipmentStat,
} from '../types/equipment';

interface AppliedModifier {
  readonly stat: EquipmentStat;
  readonly delta: number;
}

interface EquippedItem {
  readonly definition: EquipmentDefinition;
  readonly appliedModifiers: readonly AppliedModifier[];
}

export class EquipmentSystem {
  private readonly player: Player;
  private readonly equippedItems = new Map<EquipmentSlot, EquippedItem>();

  constructor(player: Player) {
    this.player = player;
  }

  canEquip(equipment: EquipmentDefinition): boolean {
    return equipment.allowedClasses.includes(this.player.playerClass);
  }

  equip(equipment: EquipmentDefinition): EquipmentResult {
    if (!this.canEquip(equipment)) {
      throw new Error(
        `${this.player.playerClass} cannot equip ${equipment.label}.`,
      );
    }

    const previousItem = this.equippedItems.get(equipment.slot) ?? null;

    if (previousItem) {
      this.removeModifiers(previousItem.appliedModifiers);
    }

    const appliedModifiers = equipment.modifiers.map((modifier) =>
      this.applyModifier(modifier),
    );
    this.equippedItems.set(equipment.slot, {
      definition: equipment,
      appliedModifiers,
    });

    return {
      equipped: equipment,
      replaced: previousItem?.definition ?? null,
    };
  }

  getEquipped(slot: EquipmentSlot): EquipmentDefinition | null {
    return this.equippedItems.get(slot)?.definition ?? null;
  }

  getEquippedItems(): readonly EquipmentDefinition[] {
    return [...this.equippedItems.values()].map((item) => item.definition);
  }

  private applyModifier(modifier: EquipmentModifier): AppliedModifier {
    const currentValue = this.player.stats[modifier.stat];
    const rawDelta =
      modifier.mode === ModifierMode.Flat
        ? modifier.value
        : currentValue * modifier.value;
    const delta = roundStat(rawDelta);

    this.player.stats[modifier.stat] = roundStat(currentValue + delta);

    if (modifier.stat === 'maxHealth' && delta > 0) {
      this.player.stats.health = Math.min(
        this.player.stats.maxHealth,
        this.player.stats.health + delta,
      );
    }

    return { stat: modifier.stat, delta };
  }

  private removeModifiers(modifiers: readonly AppliedModifier[]): void {
    for (const modifier of modifiers) {
      this.player.stats[modifier.stat] = roundStat(
        this.player.stats[modifier.stat] - modifier.delta,
      );
    }

    this.player.stats.health = Math.min(
      this.player.stats.health,
      this.player.stats.maxHealth,
    );
  }
}

function roundStat(value: number): number {
  return Math.round(value * 100) / 100;
}
