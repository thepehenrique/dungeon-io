import Phaser from 'phaser';

import { DROP_CONFIG } from '../config/drops';
import { RUN_OBJECTIVE_CONFIG } from '../config/runObjective';
import { ITEM_RARITY_PRESENTATION } from '../config/itemRarities';
import type { Chest } from '../items/chests/Chest';
import type { ChestManager } from '../items/chests/ChestManager';
import { formatItemDetails } from '../items/itemPresentation';
import type { WorldItem } from '../items/world/WorldItem';
import type { Player } from '../player/Player';
import type { DungeonKey } from '../objectives/DungeonKey';
import type { ExitDoor } from '../objectives/ExitDoor';
import { ItemType } from '../types/item';
import type { DropSystem } from './DropSystem';
import type { InventorySystem } from './InventorySystem';
import type { RunObjectiveSystem } from './RunObjectiveSystem';

type InteractionTarget =
  | { readonly type: 'ITEM'; readonly item: WorldItem }
  | { readonly type: 'CHEST'; readonly chest: Chest }
  | { readonly type: 'DUNGEON_KEY'; readonly key: DungeonKey }
  | { readonly type: 'EXIT_DOOR'; readonly door: ExitDoor };

export interface InteractionFeedback {
  readonly x: number;
  readonly y: number;
  readonly message: string;
  readonly color: string;
}

export class InteractionSystem {
  private readonly prompt: Phaser.GameObjects.Text;
  private selected: InteractionTarget | null = null;

  constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
    private readonly inventory: InventorySystem,
    private readonly drops: DropSystem,
    private readonly chests: ChestManager,
    private readonly objectives: RunObjectiveSystem,
    private readonly hasLineOfSight: (x: number, y: number) => boolean,
    private readonly onChestOpened: (chest: Chest) => void,
    private readonly onFeedback: (feedback: InteractionFeedback) => void,
  ) {
    this.prompt = scene.add
      .text(0, 0, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        align: 'center',
        color: '#f4f5f7',
        backgroundColor: '#080c12ee',
        stroke: '#080a0d',
        strokeThickness: 3,
        padding: { x: 12, y: 9 },
      })
      .setOrigin(0.5, 1)
      .setDepth(210)
      .setVisible(false);
  }

  update(enabled: boolean): void {
    if (!enabled || this.player.isDead) {
      this.select(null);
      return;
    }

    const rangeSquared = Math.max(
      DROP_CONFIG.interactionRange,
      RUN_OBJECTIVE_CONFIG.interactionRange,
    ) ** 2;
    let nearest: InteractionTarget | null = null;
    let nearestDistance = rangeSquared;

    for (const item of this.drops.getWorldItems()) {
      const distance = Phaser.Math.Distance.Squared(
        this.player.x,
        this.player.y,
        item.x,
        item.y,
      );

      if (
        distance <= nearestDistance &&
        this.hasLineOfSight(item.x, item.y)
      ) {
        nearest = { type: 'ITEM', item };
        nearestDistance = distance;
      }
    }

    for (const chest of this.chests.getChests()) {
      if (!chest.active || chest.isOpen) {
        continue;
      }

      const distance = Phaser.Math.Distance.Squared(
        this.player.x,
        this.player.y,
        chest.x,
        chest.y,
      );

      if (
        distance < nearestDistance &&
        this.hasLineOfSight(chest.x, chest.y)
      ) {
        nearest = { type: 'CHEST', chest };
        nearestDistance = distance;
      }
    }

    const key = this.objectives.key;

    if (key) {
      const distance = Phaser.Math.Distance.Squared(
        this.player.x,
        this.player.y,
        key.x,
        key.y,
      );

      if (
        distance < nearestDistance &&
        this.hasLineOfSight(key.x, key.y)
      ) {
        nearest = { type: 'DUNGEON_KEY', key };
        nearestDistance = distance;
      }
    }

    const door = this.objectives.exitDoor;
    const exitDistance = Phaser.Math.Distance.Squared(
      this.player.x,
      this.player.y,
      door.x,
      door.y,
    );

    if (
      exitDistance < nearestDistance &&
      this.hasLineOfSight(door.x, door.y)
    ) {
      nearest = { type: 'EXIT_DOOR', door };
    }

    this.select(nearest);

    if (nearest?.type === 'ITEM') {
      this.prompt.setPosition(
        nearest.item.x,
        nearest.item.y - DROP_CONFIG.promptOffsetY,
      );
    } else if (nearest?.type === 'CHEST') {
      this.prompt.setPosition(
        nearest.chest.x,
        nearest.chest.y - DROP_CONFIG.promptOffsetY,
      );
    } else if (nearest?.type === 'DUNGEON_KEY') {
      this.prompt.setPosition(nearest.key.x, nearest.key.y - 34);
    } else if (nearest?.type === 'EXIT_DOOR') {
      this.prompt.setPosition(
        nearest.door.x,
        nearest.door.y - RUN_OBJECTIVE_CONFIG.exitDoorPromptOffsetY,
      );
    }
  }

  interact(): void {
    const target = this.selected;

    if (!target) {
      return;
    }

    if (target.type === 'CHEST') {
      if (target.chest.open()) {
        this.onChestOpened(target.chest);
      }
      this.select(null);
      return;
    }

    if (target.type === 'DUNGEON_KEY') {
      this.select(null);
      this.objectives.collectKey();
      return;
    }

    if (target.type === 'EXIT_DOOR') {
      const result = this.objectives.interactWithExit();

      if (result === 'LOCKED') {
        this.onFeedback({
          x: target.door.x,
          y: target.door.y - RUN_OBJECTIVE_CONFIG.exitDoorFeedbackOffsetY,
          message: 'Você precisa encontrar a chave.',
          color: '#ed7777',
        });
      }

      this.select(null);
      return;
    }

    this.collectItem(target.item);
  }

  destroy(): void {
    this.select(null);
    this.prompt.destroy();
  }

  private collectItem(item: WorldItem): void {
    const definition = item.definition;

    if (definition.type === ItemType.Backpack) {
      const result = this.inventory.equipBackpack(
        item.itemInstance,
        definition,
      );

      if (!result.success) {
        this.feedback(item, result.message, '#ed7777');
        return;
      }

      this.feedback(
        item,
        result.message,
        ITEM_RARITY_PRESENTATION[definition.rarity].color,
      );
      this.select(null);
      this.drops.collectWorldItem(item);

      if (result.replaced) {
        this.drops.spawnExistingItem(
          result.replaced,
          1,
          this.player.x,
          this.player.y,
        );
      }

      return;
    }

    const result = this.inventory.addItem(item.itemInstance, item.quantity);

    if (!result.success) {
      this.feedback(item, result.message, '#ed7777');
      return;
    }

    this.feedback(
      item,
      result.message,
      ITEM_RARITY_PRESENTATION[definition.rarity].color,
    );
    this.select(null);
    this.drops.collectWorldItem(item);
  }

  private feedback(item: WorldItem, message: string, color: string): void {
    this.onFeedback({ x: item.x, y: item.y, message, color });
  }

  private select(target: InteractionTarget | null): void {
    if (sameTarget(this.selected, target)) {
      this.prompt.setVisible(target !== null);
      return;
    }

    if (this.selected?.type === 'ITEM') {
      this.selected.item.setSelected(false);
    } else if (this.selected?.type === 'CHEST') {
      this.selected.chest.setSelected(false);
    } else if (this.selected?.type === 'DUNGEON_KEY') {
      this.selected.key.setSelected(false);
    } else if (this.selected?.type === 'EXIT_DOOR') {
      this.selected.door.setSelected(false);
    }

    this.selected = target;

    if (!target) {
      this.prompt.setVisible(false);
      return;
    }

    if (target.type === 'ITEM') {
      const rarity = ITEM_RARITY_PRESENTATION[target.item.definition.rarity];
      const quantity = target.item.quantity > 1
        ? ` x${target.item.quantity}`
        : '';
      target.item.setSelected(true);
      this.prompt
        .setText(
          `${target.item.definition.name}${quantity}\n${rarity.label.toUpperCase()}\n\n${formatItemDetails(target.item.definition)}\n\n[E] Pegar`,
        )
        .setColor(rarity.color)
        .setVisible(true);
      return;
    }

    if (target.type === 'DUNGEON_KEY') {
      target.key.setSelected(true);
      this.prompt
        .setText('Chave da Masmorra\n\n[E] Pegar')
        .setColor('#f5c451')
        .setVisible(true);
      return;
    }

    if (target.type === 'EXIT_DOOR') {
      target.door.setSelected(true);
      this.prompt
        .setText(
          !this.objectives.hasKey
            ? 'PORTA DE SAÍDA\nTrancada\n\nVocê precisa encontrar a chave.'
            : 'PORTA DE SAÍDA\n\n[E] Abrir porta',
        )
        .setColor('#e6c87a')
        .setVisible(true);
      return;
    }

    target.chest.setSelected(true);
    this.prompt
      .setText(`${target.chest.label}\n\n[E] Abrir`)
      .setColor('#f0cb6a')
      .setVisible(true);
  }
}

function sameTarget(
  first: InteractionTarget | null,
  second: InteractionTarget | null,
): boolean {
  if (!first || !second || first.type !== second.type) {
    return first === second;
  }

  if (first.type === 'ITEM' && second.type === 'ITEM') {
    return first.item === second.item;
  }

  if (first.type === 'DUNGEON_KEY' && second.type === 'DUNGEON_KEY') {
    return first.key === second.key;
  }

  if (first.type === 'EXIT_DOOR' && second.type === 'EXIT_DOOR') {
    return first.door === second.door;
  }

  return first.type === 'CHEST' && second.type === 'CHEST'
    ? first.chest === second.chest
    : false;
}
