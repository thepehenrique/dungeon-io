import Phaser from 'phaser';

import type { Player } from '../player/Player';
import { ArrowProjectile } from '../projectiles/ArrowProjectile';
import type { ProjectileManager } from '../projectiles/ProjectileManager';
import { PrimaryWeapon } from './PrimaryWeapon';

export class ArrowWeapon extends PrimaryWeapon {
  private readonly projectiles: ProjectileManager;

  constructor(scene: Phaser.Scene, owner: Player, projectiles: ProjectileManager) {
    super(scene, owner);
    this.projectiles = projectiles;
  }

  protected performAttack(direction: Phaser.Math.Vector2): void {
    this.owner.playBowAttack(direction);

    this.projectiles.add(
      new ArrowProjectile(this.scene, {
        ownerId: this.owner.playerId,
        damage: this.owner.stats.damage,
        maxRange: this.owner.stats.attackRange,
        origin: new Phaser.Math.Vector2(this.owner.x, this.owner.y),
        direction: direction.clone(),
        critical: {
          chance: this.owner.stats.criticalChance,
          multiplier: this.owner.stats.criticalMultiplier,
        },
      }),
    );
  }
}
