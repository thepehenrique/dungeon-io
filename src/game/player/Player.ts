import Phaser from 'phaser';

import {
  MAGE_PROTECTION_CONFIG,
  WARRIOR_BLOCK_CONFIG,
} from '../config/classAbilities';
import { COMBAT_BALANCE } from '../config/combat';
import { PLAYER_MOVEMENT } from '../config/playerMovement';
import type { CombatStats, DamageRequest } from '../types/combat';
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
  private readonly aimDirection = new Phaser.Math.Vector2(1, 0);
  private blocking = false;
  private dashing = false;
  private magicProtectionActive = false;
  private abilityAura: Phaser.GameObjects.Arc | null = null;

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

    if (this.playerClass === PlayerClass.Mage) {
      this.abilityAura = scene.add
        .circle(this.x, this.y, 34, 0x786de8, 0.18)
        .setStrokeStyle(3, 0xa99cff, 0.9)
        .setDepth(9)
        .setVisible(false);
    }
  }

  move(direction: Phaser.Math.Vector2, speed = this.stats.movementSpeed): void {
    this.updateAbilityAuraPosition();

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

    direction.normalize().scale(speed);
    this.setVelocity(direction.x, direction.y);
    this.updateWarriorMovementAnimation();
    this.updateArcherMovementAnimation();
  }

  face(targetX: number, targetY: number): void {
    const aimX = targetX - this.x;
    const aimY = targetY - this.y;

    if (aimX !== 0 || aimY !== 0) {
      this.aimDirection.set(aimX, aimY).normalize();
    }

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

  get canAttack(): boolean {
    return !this.dead && !this.blocking;
  }

  getIncomingDamageMultiplier(request: DamageRequest): number {
    if (this.magicProtectionActive) {
      return 1 - MAGE_PROTECTION_CONFIG.damageReduction;
    }

    if (!this.blocking || !request.sourcePosition) {
      return 1;
    }

    const directionToSource = new Phaser.Math.Vector2(
      request.sourcePosition.x - this.x,
      request.sourcePosition.y - this.y,
    );

    if (directionToSource.lengthSq() === 0) {
      return 1;
    }

    const frontThreshold = Math.cos(WARRIOR_BLOCK_CONFIG.frontalArc / 2);
    const sourceDot = this.aimDirection.dot(directionToSource.normalize());

    return sourceDot >= frontThreshold
      ? 1 - WARRIOR_BLOCK_CONFIG.damageReduction
      : 1;
  }

  playHitFeedback(): void {
    if (this.dead) {
      return;
    }

    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(COMBAT_BALANCE.hitFlashDurationMs, () => {
      if (this.active && !this.dead) {
        this.refreshAbilityPresentation();
      }
    });
  }

  setBlocking(active: boolean): void {
    const nextState = this.isWarrior && !this.dead && active;

    if (nextState === this.blocking) {
      return;
    }

    this.blocking = nextState;
    this.refreshAbilityPresentation();
  }

  setDashing(active: boolean): void {
    const nextState = this.isArcher && !this.dead && active;

    if (nextState === this.dashing) {
      return;
    }

    this.dashing = nextState;
    this.refreshAbilityPresentation();
  }

  setMagicProtection(active: boolean): void {
    const nextState = this.playerClass === PlayerClass.Mage && !this.dead && active;

    if (nextState === this.magicProtectionActive) {
      return;
    }

    this.magicProtectionActive = nextState;
    this.refreshAbilityPresentation();
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
    this.blocking = false;
    this.dashing = false;
    this.magicProtectionActive = false;
    this.setVelocity(0, 0);
    this.refreshAbilityPresentation();

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

  private refreshAbilityPresentation(): void {
    this.clearTint();
    this.setAlpha(this.dashing ? 0.72 : 1);

    if (this.dead) {
      this.setTint(0x555555);
    } else if (this.blocking) {
      this.setTint(0x9fc8ff);
    }

    if (this.abilityAura) {
      this.abilityAura.setVisible(this.magicProtectionActive && !this.dead);
      this.updateAbilityAuraPosition();
    }
  }

  private updateAbilityAuraPosition(): void {
    this.abilityAura?.setPosition(this.x, this.y);
  }
}
