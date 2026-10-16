import Phaser from 'phaser';

import { EnemySound } from '../audio/EnemySound';
import { GOBLIN_ATTACK_SOUND, GOBLIN_ALERT_SOUNDS } from '../config/audio';
import type { Player } from '../player/Player';
import { EnemyState, EnemyType } from '../types/enemy';
import { Enemy, type EnemyLineOfSightTest } from './Enemy';
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
  private hasSpottedPlayer = false;
  private readonly alertSound: EnemySound;

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
    const voice = GOBLIN_ALERT_SOUNDS[Math.floor(Math.random() * GOBLIN_ALERT_SOUNDS.length)];
    this.alertSound = new EnemySound(this, voice);
  }

  override updateAI(
    player: Player,
    onAttack: (attacker: Enemy, target: Player) => void,
    hasLineOfSight: EnemyLineOfSightTest,
  ): void {
    super.updateAI(player, onAttack, hasLineOfSight);

    if (this.isDead || !this.active) {
      this.alertSound.stop();
      return;
    }

    this.setRotation(0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    const isMoving = body.velocity.lengthSq() > 0;
    this.hasSpottedPlayer ||= this.aiState === EnemyState.Chase || this.aiState === EnemyState.Attack;
    this.alertSound.update(player, this.hasSpottedPlayer);

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
    this.scene.sound.play(GOBLIN_ATTACK_SOUND.key, { volume: GOBLIN_ATTACK_SOUND.volume });
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

  override die(): void {
    this.alertSound.stop();
    super.die();
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
