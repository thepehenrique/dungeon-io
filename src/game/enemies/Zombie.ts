import Phaser from 'phaser';

import { EnemySound } from '../audio/EnemySound';
import { ZOMBIE_MOVEMENT_SOUND_CONFIG } from '../config/audio';
import type { Player } from '../player/Player';
import { EnemyState, EnemyType } from '../types/enemy';
import { Enemy, type EnemyLineOfSightTest } from './Enemy';
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
  private readonly movementSound: EnemySound;

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
    this.movementSound = new EnemySound(this, ZOMBIE_MOVEMENT_SOUND_CONFIG);
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
    this.movementSound.stop();
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

  override die(): void {
    this.movementSound.stop();
    super.die();
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
