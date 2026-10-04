import Phaser from 'phaser';

import type { Player } from '../player/Player';

export abstract class PrimaryWeapon {
  protected readonly scene: Phaser.Scene;
  protected readonly owner: Player;

  private nextAttackAt = 0;

  protected constructor(scene: Phaser.Scene, owner: Player) {
    this.scene = scene;
    this.owner = owner;
  }

  tryAttack(target: Phaser.Math.Vector2): boolean {
    if (this.scene.time.now < this.nextAttackAt) {
      return false;
    }

    const direction = new Phaser.Math.Vector2(
      target.x - this.owner.x,
      target.y - this.owner.y,
    );

    if (direction.lengthSq() === 0) {
      direction.setToPolar(this.owner.rotation);
    } else {
      direction.normalize();
    }

    this.nextAttackAt = this.scene.time.now + 1000 / this.owner.stats.attackSpeed;
    this.performAttack(direction);
    return true;
  }

  protected abstract performAttack(direction: Phaser.Math.Vector2): void;
}
