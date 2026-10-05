import Phaser from 'phaser';

import type {
  AttackKind,
  CriticalStrikeData,
  ProjectileDefinition,
} from '../types/combat';

export interface ProjectileLaunchData {
  readonly ownerId: string;
  readonly damage: number;
  readonly maxRange?: number;
  readonly origin: Phaser.Math.Vector2;
  readonly direction: Phaser.Math.Vector2;
  readonly critical?: CriticalStrikeData;
}

export abstract class BaseProjectile extends Phaser.Physics.Arcade.Sprite {
  abstract readonly attackKind: AttackKind;
  readonly ownerId: string;
  readonly damage: number;
  readonly critical?: CriticalStrikeData;

  private readonly launchPosition: Phaser.Math.Vector2;
  private readonly launchVelocity: Phaser.Math.Vector2;
  private readonly maxRangeSquared: number | null;
  private impacted = false;

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
    this.critical = launchData.critical;
    this.launchPosition = spawnPosition;
    this.launchVelocity = launchData.direction
      .clone()
      .scale(definition.speed);
    this.maxRangeSquared = launchData.maxRange === undefined
      ? null
      : launchData.maxRange ** 2;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(
      definition.bodyRadius,
      this.width / 2 - definition.bodyRadius,
      this.height / 2 - definition.bodyRadius,
    );
    this.setRotation(launchData.direction.angle());
    this.setDepth(8);
  }

  launch(): void {
    this.setVelocity(this.launchVelocity.x, this.launchVelocity.y);
  }

  updateProjectile(): void {
    if (!this.scene.physics.world.bounds.contains(this.x, this.y)) {
      this.destroy();
      return;
    }

    if (this.maxRangeSquared === null) {
      return;
    }

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

  registerImpact(): boolean {
    if (this.impacted || !this.active) {
      return false;
    }

    this.impacted = true;
    return true;
  }
}
