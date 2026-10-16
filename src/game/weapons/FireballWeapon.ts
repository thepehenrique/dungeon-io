import Phaser from 'phaser';

import { FIREBALL_CAST_SOUND } from '../config/audio';
import type { Player } from '../player/Player';
import { FireballProjectile } from '../projectiles/FireballProjectile';
import type { ProjectileManager } from '../projectiles/ProjectileManager';
import { PrimaryWeapon } from './PrimaryWeapon';

export class FireballWeapon extends PrimaryWeapon {
  private readonly projectiles: ProjectileManager;

  constructor(scene: Phaser.Scene, owner: Player, projectiles: ProjectileManager) {
    super(scene, owner);
    this.projectiles = projectiles;
  }

  protected performAttack(direction: Phaser.Math.Vector2): void {
    this.owner.playMageCast(direction);
    this.projectiles.add(
      new FireballProjectile(this.scene, {
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
    this.scene.sound.play(FIREBALL_CAST_SOUND.key, { volume: FIREBALL_CAST_SOUND.volume });
  }
}
