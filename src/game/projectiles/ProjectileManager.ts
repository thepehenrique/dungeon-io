import Phaser from 'phaser';

import { Enemy } from '../enemies/Enemy';
import { BaseProjectile } from './BaseProjectile';

export class ProjectileManager {
  private readonly group: Phaser.Physics.Arcade.Group;
  private readonly wallCollider: Phaser.Physics.Arcade.Collider;
  private enemyOverlap: Phaser.Physics.Arcade.Collider | null = null;

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

  registerEnemyTargets(
    enemies: Phaser.Physics.Arcade.Group,
    onHit: (projectile: BaseProjectile, enemy: Enemy) => void,
  ): void {
    this.enemyOverlap?.destroy();
    this.enemyOverlap = this.group.scene.physics.add.overlap(
      this.group,
      enemies,
      (projectile, enemy) => {
        if (projectile instanceof BaseProjectile && enemy instanceof Enemy) {
          onHit(projectile, enemy);
          projectile.destroy();
        }
      },
    );
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
    this.enemyOverlap?.destroy();
    this.enemyOverlap = null;
    this.group.clear(true, true);
  }
}
