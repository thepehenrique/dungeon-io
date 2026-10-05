import Phaser from 'phaser';

import { PLAYER_MOVEMENT } from '../config/playerMovement';
import type { CombatStats } from '../types/combat';
import { PlayerClass, type PlayerStats } from '../types/player';
import { createPlayerStats } from './createPlayerStats';
import { restoreHealth } from './health';
import { getPlayerTextureKey } from './playerTextures';
import {
  ARCHER_SPRITE,
  ARCHER_TEXTURE_KEYS,
  getArcherAttackAnimationKey,
  getArcherFacing,
  getArcherIdleFrame,
  getArcherWalkAnimationKey,
  type ArcherFacing,
} from './archerAnimations';
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
  private archerFacing: ArcherFacing = 'down';
  private archerMoving = false;
  private archerAttacking = false;

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
    } else if (this.isArcher) {
      this.setScale(ARCHER_SPRITE.scale);
      this.setCircle(
        ARCHER_SPRITE.bodyRadius,
        ARCHER_SPRITE.bodyOffsetX,
        ARCHER_SPRITE.bodyOffsetY,
      );
      this.showArcherIdleFrame();
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

    const isMoving = direction.lengthSq() > 0;
    this.warriorMoving = isMoving;
    this.archerMoving = isMoving;

    if (direction.lengthSq() === 0) {
      this.setVelocity(0, 0);
      this.updateWarriorMovementAnimation();
      this.updateArcherMovementAnimation();
      return;
    }

    direction.normalize().scale(this.stats.movementSpeed);
    this.setVelocity(direction.x, direction.y);
    this.updateWarriorMovementAnimation();
    this.updateArcherMovementAnimation();
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

    if (this.isArcher) {
      const nextFacing = getArcherFacing(targetX - this.x, targetY - this.y);

      if (nextFacing !== this.archerFacing) {
        this.archerFacing = nextFacing;
        this.updateArcherMovementAnimation();
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

  playBowAttack(direction: Phaser.Math.Vector2): void {
    if (!this.isArcher || this.dead) {
      return;
    }

    this.archerFacing = getArcherFacing(direction.x, direction.y);
    this.archerAttacking = true;

    const attackKey = getArcherAttackAnimationKey(this.archerFacing);
    this.off(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      this.finishArcherBowAttack,
      this,
    );
    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      this.finishArcherBowAttack,
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

  heal(amount: number): number {
    if (this.dead) {
      return 0;
    }

    return restoreHealth(this.stats, amount);
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

  private get isArcher(): boolean {
    return this.playerClass === PlayerClass.Archer;
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

  private updateArcherMovementAnimation(): void {
    if (!this.isArcher || this.archerAttacking || this.dead) {
      return;
    }

    if (this.archerMoving) {
      this.play(getArcherWalkAnimationKey(this.archerFacing), true);
      return;
    }

    this.showArcherIdleFrame();
  }

  private showArcherIdleFrame(): void {
    this.anims.stop();
    this.setTexture(
      ARCHER_TEXTURE_KEYS.walk,
      getArcherIdleFrame(this.archerFacing),
    );
  }

  private finishWarriorSwordAttack(): void {
    this.warriorAttacking = false;
    this.updateWarriorMovementAnimation();
  }

  private finishArcherBowAttack(): void {
    this.archerAttacking = false;
    this.updateArcherMovementAnimation();
  }
}
