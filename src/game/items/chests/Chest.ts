import Phaser from 'phaser';

import { CHEST_DEFINITIONS } from '../../config/chests';
import { ChestState } from '../../types/chest';
import type { ItemRarity } from '../../types/item';

export class Chest extends Phaser.Physics.Arcade.Sprite {
  readonly rarity: ItemRarity;
  readonly label: string;

  private chestState = ChestState.Closed;
  private readonly openAnimationKey: string;

  constructor(scene: Phaser.Scene, x: number, y: number, rarity: ItemRarity) {
    const definition = CHEST_DEFINITIONS[rarity];

    if (!definition) {
      throw new Error(`Chest definition not implemented for rarity: ${rarity}`);
    }

    super(scene, x, y, definition.textureKey, definition.closedFrame);
    this.rarity = rarity;
    this.label = definition.label;
    this.openAnimationKey = definition.openAnimationKey;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1).setScale(definition.scale);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(definition.bodyWidth, definition.bodyHeight);
    body.setOffset(definition.bodyOffsetX, definition.bodyOffsetY);
    body.updateFromGameObject();
    this.setDepth(7);
  }

  get status(): ChestState {
    return this.chestState;
  }

  get isOpen(): boolean {
    return this.chestState === ChestState.Open;
  }

  setSelected(selected: boolean): void {
    if (this.isOpen) {
      this.clearTint();
      return;
    }

    if (selected) {
      this.setTint(0xf0cb6a);
    } else {
      this.clearTint();
    }
  }

  open(): boolean {
    if (this.chestState === ChestState.Open) {
      return false;
    }

    this.chestState = ChestState.Open;
    this.play(this.openAnimationKey);
    return true;
  }
}
