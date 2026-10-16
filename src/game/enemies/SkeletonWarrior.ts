import Phaser from 'phaser';

import { EnemySound } from '../audio/EnemySound';
import { SKELETON_MOVEMENT_SOUND, SWORD_ATTACK_SOUND } from '../config/audio';
import type { Player } from '../player/Player';
import { EnemyState, EnemyType } from '../types/enemy';
import { Enemy, type EnemyLineOfSightTest } from './Enemy';
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
  private readonly movementSound: EnemySound;

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
    this.movementSound = new EnemySound(this, SKELETON_MOVEMENT_SOUND);
  }

  override updateAI(
    player: Player,
    onAttack: (attacker: Enemy, target: Player) => void,
    hasLineOfSight: EnemyLineOfSightTest,
  ): void {
    super.updateAI(player, onAttack, hasLineOfSight);

    if (this.isDead || !this.active) {
      this.movementSound.stop();
      return;
    }

    this.setRotation(0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    const isMoving = body.velocity.lengthSq() > 0;
    this.movementSound.update(player, isMoving && !this.attacking);

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
    this.movementSound.stop();
    this.scene.sound.play(SWORD_ATTACK_SOUND.key, { volume: SWORD_ATTACK_SOUND.volume });
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

  override die(): void {
    this.movementSound.stop();
    super.die();
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
