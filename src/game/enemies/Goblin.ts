import Phaser from 'phaser';

import type { Player } from '../player/Player';
import { EnemyState, EnemyType } from '../types/enemy';
import { Enemy } from './Enemy';
import {
  GOBLIN_SPRITE,
  GOBLIN_TEXTURE_KEYS,
  getGoblinAttackAnimationKey,
  getGoblinFacing,
  getGoblinIdleFrame,
  getGoblinWalkAnimationKey,
  type GoblinFacing,
} from './goblinAnimations';

export class Goblin extends Enemy {
  private facing: GoblinFacing = 'down';
  private attacking = false;

  constructor(scene: Phaser.Scene, x: number, y: number, level: number) {
    super(scene, x, y, EnemyType.Goblin, level);
    this.setScale(GOBLIN_SPRITE.scale);
    this.setCircle(
      GOBLIN_SPRITE.bodyRadius,
      GOBLIN_SPRITE.bodyOffsetX,
      GOBLIN_SPRITE.bodyOffsetY,
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
      this.facing = getGoblinFacing(body.velocity.x, body.velocity.y);
    } else if (this.aiState === EnemyState.Attack) {
      this.facing = getGoblinFacing(
        player.x - this.x,
        player.y - this.y,
      );
    }

    if (isMoving) {
      const animationKey = getGoblinWalkAnimationKey(this.facing);

      if (this.anims.currentAnim?.key !== animationKey) {
        this.play(animationKey);
      }
      return;
    }

    this.showIdleFrame();
  }

  protected override onAttackStarted(player: Player): void {
    this.facing = getGoblinFacing(player.x - this.x, player.y - this.y);
    this.attacking = true;
    this.setRotation(0);
    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      this.finishAttack,
      this,
    );
    this.play(getGoblinAttackAnimationKey(this.facing));
  }

  private showIdleFrame(): void {
    this.anims.stop();
    this.setTexture(
      GOBLIN_TEXTURE_KEYS.walk,
      getGoblinIdleFrame(this.facing),
    );
  }

  private finishAttack(): void {
    this.attacking = false;

    if (this.active && !this.isDead) {
      this.showIdleFrame();
    }
  }
}
