import Phaser from 'phaser';

import { PLAYER_MOVEMENT } from '../config/playerMovement';
import type { CombatStats } from '../types/combat';
import type { PlayerClass, PlayerStats } from '../types/player';
import { createPlayerStats } from './createPlayerStats';
import { getPlayerTextureKey } from './playerTextures';

export interface PlayerIdentity {
  readonly id: string;
  readonly name: string;
  readonly playerClass: PlayerClass;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  readonly playerId: string;
  readonly playerName: string;
  readonly playerClass: PlayerClass;
  readonly stats: PlayerStats;

  private dead = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    identity: PlayerIdentity,
  ) {
    super(scene, x, y, getPlayerTextureKey(identity.playerClass));

    this.playerId = identity.id;
    this.playerName = identity.name;
    this.playerClass = identity.playerClass;
    this.stats = createPlayerStats(identity.playerClass);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(PLAYER_MOVEMENT.bodyRadius, 6, 6);
    this.setCollideWorldBounds(true);
    this.setDepth(10);
  }

  move(direction: Phaser.Math.Vector2): void {
    if (this.dead) {
      this.setVelocity(0, 0);
      return;
    }

    if (direction.lengthSq() === 0) {
      this.setVelocity(0, 0);
      return;
    }

    direction.normalize().scale(this.stats.movementSpeed);
    this.setVelocity(direction.x, direction.y);
  }

  face(targetX: number, targetY: number): void {
    this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY));
  }

  get combatId(): string {
    return this.playerId;
  }

  get combatStats(): CombatStats {
    return this.stats;
  }

  get isDead(): boolean {
    return this.dead;
  }

  die(): void {
    if (this.dead) {
      return;
    }

    this.dead = true;
    this.setVelocity(0, 0);
    this.setTint(0x555555);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
  }
}
