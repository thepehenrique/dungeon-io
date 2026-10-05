import Phaser from 'phaser';

import { getItemDefinition } from '../ItemRegistry';
import type { ItemInstance } from '../../types/item';
import { WorldItem } from './WorldItem';

export class WorldItemManager {
  private readonly items: WorldItem[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  spawn(
    definitionId: string,
    quantity: number,
    x: number,
    y: number,
  ): WorldItem {
    return this.spawnInstance(
      { instanceId: crypto.randomUUID(), definitionId },
      quantity,
      x,
      y,
    );
  }

  spawnInstance(
    instance: ItemInstance,
    quantity: number,
    x: number,
    y: number,
  ): WorldItem {
    const definition = getItemDefinition(instance.definitionId);

    if (!definition) {
      throw new Error(`Unknown item definition: ${instance.definitionId}`);
    }

    const item = new WorldItem(
      this.scene,
      x,
      y,
      instance,
      definition,
      quantity,
    );
    this.items.push(item);
    return item;
  }

  remove(item: WorldItem): void {
    const index = this.items.indexOf(item);

    if (index >= 0) {
      this.items.splice(index, 1);
    }

    if (item.active) {
      item.destroy();
    }
  }

  getItems(): readonly WorldItem[] {
    return this.items.filter((item) => item.active);
  }

  destroy(): void {
    for (const item of this.items) {
      if (item.active) {
        item.destroy();
      }
    }

    this.items.length = 0;
  }
}
