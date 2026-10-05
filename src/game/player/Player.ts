import Phaser from 'phaser';

import { PLAYER_MOVEMENT } from '../config/playerMovement';
import type { CombatStats } from '../types/combat';
import { PlayerClass, type PlayerStats } from '../types/player';
import { createPlayerStats } from './createPlayerStats';
import { getPlayerTextureKey } from './playerTextures';
import {
  getWarriorAttackAnimationKey,
  getWarriorFacing,
  getWarriorIdleFrame,
  getWarriorWalkAnimationKey,
  WARRIOR_SPRITE,
  WARRIOR_TEXTURE_KEYS,
  type WarriorFacing,
} from './warriorAnimations';

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
  private warriorFacing: WarriorFacing = 'down';
  private warriorMoving = false;
  private warriorAttacking = false;

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

    if (this.isWarrior) {
      this.setScale(WARRIOR_SPRITE.scale);
      this.setCircle(
        WARRIOR_SPRITE.bodyRadius,
        WARRIOR_SPRITE.bodyOffsetX,
        WARRIOR_SPRITE.bodyOffsetY,
      );
      this.showWarriorIdleFrame();
    } else {
      this.setCircle(PLAYER_MOVEMENT.bodyRadius, 6, 6);
    }

    this.setCollideWorldBounds(true);
    this.setDepth(10);
  }

  move(direction: Phaser.Math.Vector2): void {
    if (this.dead) {
      this.setVelocity(0, 0);
      return;
    }

    this.warriorMoving = direction.lengthSq() > 0;

    if (direction.lengthSq() === 0) {
      this.setVelocity(0, 0);
      this.updateWarriorMovementAnimation();
      return;
    }

    direction.normalize().scale(this.stats.movementSpeed);
    this.setVelocity(direction.x, direction.y);
    this.updateWarriorMovementAnimation();
  }

  face(targetX: number, targetY: number): void {
    if (this.isWarrior) {
      const nextFacing = getWarriorFacing(targetX - this.x, targetY - this.y);

      if (nextFacing !== this.warriorFacing) {
        this.warriorFacing = nextFacing;
        this.updateWarriorMovementAnimation();
      }

      this.setRotation(0);
      return;
    }

    this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY));
  }

  playSwordAttack(direction: Phaser.Math.Vector2): void {
    if (!this.isWarrior || this.dead) {
      return;
    }

    this.warriorFacing = getWarriorFacing(direction.x, direction.y);
    this.warriorAttacking = true;

    const attackKey = getWarriorAttackAnimationKey(this.warriorFacing);
    this.off(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      this.finishWarriorSwordAttack,
      this,
    );
    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      this.finishWarriorSwordAttack,
      this,
    );
    this.play(attackKey);
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

  private get isWarrior(): boolean {
    return this.playerClass === PlayerClass.Warrior;
  }

  private updateWarriorMovementAnimation(): void {
    if (!this.isWarrior || this.warriorAttacking || this.dead) {
      return;
    }

    if (this.warriorMoving) {
      this.play(getWarriorWalkAnimationKey(this.warriorFacing), true);
      return;
    }

    this.showWarriorIdleFrame();
  }

  private showWarriorIdleFrame(): void {
    this.anims.stop();
    this.setTexture(
      WARRIOR_TEXTURE_KEYS.walk,
      getWarriorIdleFrame(this.warriorFacing),
    );
  }

  private finishWarriorSwordAttack(): void {
    this.warriorAttacking = false;
    this.updateWarriorMovementAnimation();
  }
}
