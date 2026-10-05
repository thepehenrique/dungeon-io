import Phaser from 'phaser';

import type { ConsumableDefinition } from '../../types/consumable';

export class ConsumablePickup extends Phaser.Physics.Arcade.Sprite {
  readonly definition: ConsumableDefinition;

  private unavailableFeedbackShown = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    definition: ConsumableDefinition,
  ) {
    super(scene, x, y, definition.textureKey);
    this.definition = definition;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    const offsetX = this.width / 2 - definition.pickupRadius;
    const offsetY = this.height / 2 - definition.pickupRadius;
    body.setCircle(definition.pickupRadius, offsetX, offsetY);
    body.updateFromGameObject();
    this.setDepth(8);
  }

  markUnavailableFeedbackShown(): boolean {
    if (this.unavailableFeedbackShown) {
      return false;
    }

    this.unavailableFeedbackShown = true;
    return true;
  }

  collect(): void {
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = false;
    this.destroy();
  }
}
