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
    const icon = scene.add.image(0, 0, getTextureKey(definition));

    if (definition.type !== ItemType.Consumable) {
      icon.setTint(rarityColor);
    }

    this.add(icon);
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

  setSelected(_selected: boolean): void {
    // Selection is communicated by the interaction prompt; world drops keep
    // their original sprite silhouette without an artificial rarity circle.
  }
}

function getTextureKey(definition: RegisteredItemDefinition): string {
  switch (definition.type) {
    case ItemType.Equipment:
      return WORLD_ITEM_TEXTURE_KEYS.equipment;
    case ItemType.Consumable:
      return definition.textureKey;
    case ItemType.Backpack:
      return WORLD_ITEM_TEXTURE_KEYS.backpack;
  }
}
