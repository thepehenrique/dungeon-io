import Phaser from 'phaser';

import { DROP_CONFIG, WORLD_ITEM_TEXTURE_KEYS } from '../../config/drops';

export class GoldPickup extends Phaser.Physics.Arcade.Sprite {
  readonly quantity: number;

  constructor(scene: Phaser.Scene, x: number, y: number, quantity: number) {
    super(scene, x, y, WORLD_ITEM_TEXTURE_KEYS.gold);
    this.quantity = quantity;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    const radius = DROP_CONFIG.goldPickupRadius;
    body.setCircle(radius, this.width / 2 - radius, this.height / 2 - radius);
    body.updateFromGameObject();
    this.setDepth(8);
    scene.tweens.add({
      targets: this,
      scale: 1.12,
      duration: 500,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    });
  }

  collect(): void {
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = false;
    this.destroy();
  }
}
