import Phaser from 'phaser';

import { CHEST_DEFINITIONS } from '../../config/chests';
import { ChestState } from '../../types/chest';
import type { Rarity } from '../../types/loot';

export class Chest extends Phaser.Physics.Arcade.Sprite {
  readonly rarity: Rarity;

  private chestState = ChestState.Closed;
  private readonly openTextureKey: string;

  constructor(scene: Phaser.Scene, x: number, y: number, rarity: Rarity) {
    const definition = CHEST_DEFINITIONS[rarity];

    if (!definition) {
      throw new Error(`Chest definition not implemented for rarity: ${rarity}`);
    }

    super(scene, x, y, definition.closedTextureKey);
    this.rarity = rarity;
    this.openTextureKey = definition.openTextureKey;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(definition.bodyWidth, definition.bodyHeight);
    body.updateFromGameObject();
    this.setDepth(7);
  }

  get status(): ChestState {
    return this.chestState;
  }

  open(): boolean {
    if (this.chestState === ChestState.Open) {
      return false;
    }

    this.chestState = ChestState.Open;
    this.setTexture(this.openTextureKey);
    return true;
  }
}
