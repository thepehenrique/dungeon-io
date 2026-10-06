import Phaser from 'phaser';

import type { Player } from '../player/Player';
import { EnemyState, EnemyType } from '../types/enemy';
import { Enemy } from './Enemy';
import {
  SKELETON_SPRITE,
  SKELETON_TEXTURE_KEYS,
  getSkeletonAttackAnimationKey,
  getSkeletonFacing,
  getSkeletonIdleFrame,
  getSkeletonWalkAnimationKey,
  type SkeletonFacing,
} from './skeletonAnimations';

export class SkeletonWarrior extends Enemy {
  private facing: SkeletonFacing = 'down';
  private attacking = false;

  constructor(scene: Phaser.Scene, x: number, y: number, level: number) {
    super(scene, x, y, EnemyType.SkeletonWarrior, level);
    this.setScale(SKELETON_SPRITE.scale);
    this.setCircle(
      SKELETON_SPRITE.bodyRadius,
      SKELETON_SPRITE.bodyOffsetX,
      SKELETON_SPRITE.bodyOffsetY,
    );
    this.setRotation(0);
    this.showIdleFrame();
  }

  override updateAI(
    player: Player,
    onAttack: (attacker: Enemy, target: Player) => void,
  ): void {
    super.updateAI(player, onAttack);

    if (this.isDead || !this.active) {
      return;
    }

    this.setRotation(0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    const isMoving = body.velocity.lengthSq() > 0;

    if (this.attacking) {
      return;
    }

    if (isMoving) {
      this.facing = getSkeletonFacing(body.velocity.x, body.velocity.y);
    } else if (this.aiState === EnemyState.Attack) {
      this.facing = getSkeletonFacing(player.x - this.x, player.y - this.y);
    }

    if (isMoving) {
      const animationKey = getSkeletonWalkAnimationKey(this.facing);

      if (this.anims.currentAnim?.key !== animationKey) {
        this.play(animationKey);
      }
      return;
    }

    this.showIdleFrame();
  }

  protected override onAttackStarted(player: Player): void {
    this.facing = getSkeletonFacing(player.x - this.x, player.y - this.y);
    this.attacking = true;
    this.setRotation(0);
    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      this.finishAttack,
      this,
    );
    this.play(getSkeletonAttackAnimationKey(this.facing));
  }

  private showIdleFrame(): void {
    this.anims.stop();
    this.setTexture(
      SKELETON_TEXTURE_KEYS.walk,
      getSkeletonIdleFrame(this.facing),
    );
  }

  private finishAttack(): void {
    this.attacking = false;

    if (this.active && !this.isDead) {
      this.showIdleFrame();
    }
  }
}
