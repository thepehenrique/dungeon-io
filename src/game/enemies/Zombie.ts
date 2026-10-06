import Phaser from 'phaser';

import type { Player } from '../player/Player';
import { EnemyState, EnemyType } from '../types/enemy';
import { Enemy } from './Enemy';
import {
  ZOMBIE_SPRITE,
  ZOMBIE_TEXTURE_KEYS,
  getZombieAttackAnimationKey,
  getZombieFacing,
  getZombieIdleFrame,
  getZombieWalkAnimationKey,
  type ZombieFacing,
} from './zombieAnimations';

export class Zombie extends Enemy {
  private facing: ZombieFacing = 'down';
  private attacking = false;

  constructor(scene: Phaser.Scene, x: number, y: number, level: number) {
    super(scene, x, y, EnemyType.Zombie, level);
    this.setScale(ZOMBIE_SPRITE.scale);
    this.setCircle(
      ZOMBIE_SPRITE.bodyRadius,
      ZOMBIE_SPRITE.bodyOffsetX,
      ZOMBIE_SPRITE.bodyOffsetY,
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
      this.facing = getZombieFacing(body.velocity.x, body.velocity.y);
    } else if (this.aiState === EnemyState.Attack) {
      this.facing = getZombieFacing(player.x - this.x, player.y - this.y);
    }

    if (isMoving) {
      const animationKey = getZombieWalkAnimationKey(this.facing);

      if (this.anims.currentAnim?.key !== animationKey) {
        this.play(animationKey);
      }
      return;
    }

    this.showIdleFrame();
  }

  protected override onAttackStarted(player: Player): void {
    this.facing = getZombieFacing(player.x - this.x, player.y - this.y);
    this.attacking = true;
    this.setRotation(0);
    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      this.finishAttack,
      this,
    );
    this.play(getZombieAttackAnimationKey(this.facing));
  }

  private showIdleFrame(): void {
    this.anims.stop();
    this.setTexture(
      ZOMBIE_TEXTURE_KEYS.walk,
      getZombieIdleFrame(this.facing),
    );
  }

  private finishAttack(): void {
    this.attacking = false;

    if (this.active && !this.isDead) {
      this.showIdleFrame();
    }
  }
}
