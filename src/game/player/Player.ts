import Phaser from 'phaser';

import { PLAYER_MOVEMENT } from '../config/playerMovement';
import type { PlayerClass } from '../types/player';
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

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(PLAYER_MOVEMENT.bodyRadius, 6, 6);
    this.setCollideWorldBounds(true);
    this.setDepth(10);
  }

  move(direction: Phaser.Math.Vector2): void {
    if (direction.lengthSq() === 0) {
      this.setVelocity(0, 0);
      return;
    }

    direction.normalize().scale(PLAYER_MOVEMENT.speed);
    this.setVelocity(direction.x, direction.y);
  }

  face(targetX: number, targetY: number): void {
    this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY));
  }
}
