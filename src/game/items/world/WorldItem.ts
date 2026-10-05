import Phaser from 'phaser';

import { ITEM_RARITY_PRESENTATION } from '../../config/itemRarities';
import { WORLD_ITEM_TEXTURE_KEYS } from '../../config/drops';
import {
  ItemType,
  type ItemInstance,
  type RegisteredItemDefinition,
} from '../../types/item';

export class WorldItem extends Phaser.GameObjects.Container {
  readonly instanceId: string;
  readonly definitionId: string;
  readonly definition: RegisteredItemDefinition;
  readonly quantity: number;
  readonly despawnTimeMs: number | null = null;
  private readonly halo: Phaser.GameObjects.Arc;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    instance: ItemInstance,
    definition: RegisteredItemDefinition,
    quantity: number,
  ) {
    super(scene, x, y);

    this.instanceId = instance.instanceId;
    this.definitionId = instance.definitionId;
    this.definition = definition;
    this.quantity = quantity;

    const rarityColor = Phaser.Display.Color.HexStringToColor(
      ITEM_RARITY_PRESENTATION[definition.rarity].color,
    ).color;
    this.halo = scene.add
      .circle(0, 0, 20, rarityColor, 0.14)
      .setStrokeStyle(2, rarityColor, 0.9);
    const icon = scene.add
      .image(0, 0, getTextureKey(definition.type))
      .setTint(rarityColor);

    this.add([this.halo, icon]);
    this.setSize(42, 42).setDepth(8);
    scene.add.existing(this);
    scene.tweens.add({
      targets: icon,
      scale: 1.08,
      duration: 650,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    });
  }

  get itemInstance(): ItemInstance {
    return {
      instanceId: this.instanceId,
      definitionId: this.definitionId,
    };
  }

  setSelected(selected: boolean): void {
    this.halo.setAlpha(selected ? 1 : 0.45);
    this.halo.setScale(selected ? 1.12 : 1);
  }
}

function getTextureKey(type: ItemType): string {
  switch (type) {
    case ItemType.Equipment:
      return WORLD_ITEM_TEXTURE_KEYS.equipment;
    case ItemType.Consumable:
      return WORLD_ITEM_TEXTURE_KEYS.consumable;
    case ItemType.Backpack:
      return WORLD_ITEM_TEXTURE_KEYS.backpack;
  }
}
