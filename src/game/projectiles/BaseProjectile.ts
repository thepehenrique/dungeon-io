import Phaser from 'phaser';

import type { ProjectileDefinition } from '../types/combat';

export interface ProjectileLaunchData {
  readonly ownerId: string;
  readonly damage: number;
  readonly maxRange: number;
  readonly origin: Phaser.Math.Vector2;
  readonly direction: Phaser.Math.Vector2;
}

export abstract class BaseProjectile extends Phaser.Physics.Arcade.Sprite {
  readonly ownerId: string;
  readonly damage: number;

  private readonly launchPosition: Phaser.Math.Vector2;
  private readonly maxRangeSquared: number;

  protected constructor(
    scene: Phaser.Scene,
    definition: ProjectileDefinition,
    launchData: ProjectileLaunchData,
  ) {
    const spawnPosition = launchData.origin
      .clone()
      .add(launchData.direction.clone().scale(definition.spawnOffset));

    super(scene, spawnPosition.x, spawnPosition.y, definition.textureKey);

    this.ownerId = launchData.ownerId;
    this.damage = launchData.damage;
    this.launchPosition = spawnPosition;
    this.maxRangeSquared = launchData.maxRange ** 2;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(
      definition.bodyRadius,
      this.width / 2 - definition.bodyRadius,
      this.height / 2 - definition.bodyRadius,
    );
    this.setRotation(launchData.direction.angle());
    this.setVelocity(
      launchData.direction.x * definition.speed,
      launchData.direction.y * definition.speed,
    );
    this.setDepth(8);
  }

  updateProjectile(): void {
    const distanceSquared = Phaser.Math.Distance.Squared(
      this.launchPosition.x,
      this.launchPosition.y,
      this.x,
      this.y,
    );

    if (distanceSquared >= this.maxRangeSquared) {
      this.destroy();
    }
  }
}
