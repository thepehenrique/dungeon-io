import Phaser from 'phaser';

import { BaseProjectile } from './BaseProjectile';

export class ProjectileManager {
  private readonly group: Phaser.Physics.Arcade.Group;
  private readonly wallCollider: Phaser.Physics.Arcade.Collider;

  constructor(scene: Phaser.Scene, walls: Phaser.Physics.Arcade.StaticGroup) {
    this.group = scene.physics.add.group({ allowGravity: false });
    this.wallCollider = scene.physics.add.collider(
      this.group,
      walls,
      (projectile) => {
        if (projectile instanceof BaseProjectile) {
          projectile.destroy();
        }
      },
    );
  }

  add(projectile: BaseProjectile): void {
    this.group.add(projectile);
  }

  update(): void {
    for (const child of [...this.group.getChildren()]) {
      if (child instanceof BaseProjectile && child.active) {
        child.updateProjectile();
      }
    }
  }

  destroy(): void {
    this.wallCollider.destroy();
    this.group.clear(true, true);
  }
}
