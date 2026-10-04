import Phaser from 'phaser';

import { ENEMY_DEFINITIONS } from '../config/enemies';
import type { Player } from '../player/Player';
import { EnemyState, type EnemyStats, type EnemyType } from '../types/enemy';
import { createEnemyStats } from './createEnemyStats';

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  readonly enemyId: string;
  readonly enemyType: EnemyType;
  readonly level: number;
  readonly stats: EnemyStats;

  private currentAiState = EnemyState.Idle;

  protected constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EnemyType,
    level: number,
  ) {
    const definition = ENEMY_DEFINITIONS[type];
    super(scene, x, y, definition.textureKey);

    this.enemyId = crypto.randomUUID();
    this.enemyType = type;
    this.level = level;
    this.stats = createEnemyStats(type);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const bodyOffset = this.width / 2 - definition.bodyRadius;
    this.setCircle(definition.bodyRadius, bodyOffset, bodyOffset);
    this.setCollideWorldBounds(true);
    this.setDepth(9);
    this.applyStatePresentation();
  }

  get aiState(): EnemyState {
    return this.currentAiState;
  }

  updateAI(player: Player): void {
    if (this.currentAiState === EnemyState.Dead || !this.active) {
      return;
    }

    if (this.stats.health <= 0) {
      this.die();
      return;
    }

    const distanceSquared = Phaser.Math.Distance.Squared(
      this.x,
      this.y,
      player.x,
      player.y,
    );

    if (distanceSquared <= this.stats.attackRange ** 2) {
      this.transitionTo(EnemyState.Attack);
      this.stopMovement();
      this.facePlayer(player);
      return;
    }

    if (distanceSquared <= this.stats.detectionRange ** 2) {
      this.transitionTo(EnemyState.Chase);
      this.chase(player);
      return;
    }

    this.transitionTo(EnemyState.Idle);
    this.stopMovement();
  }

  die(): void {
    if (this.currentAiState === EnemyState.Dead) {
      return;
    }

    this.transitionTo(EnemyState.Dead);
    this.stopMovement();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 250,
      onComplete: () => this.destroy(),
    });
  }

  private chase(player: Player): void {
    const direction = new Phaser.Math.Vector2(player.x - this.x, player.y - this.y)
      .normalize()
      .scale(this.stats.movementSpeed);

    this.setVelocity(direction.x, direction.y);
    this.facePlayer(player);
  }

  private facePlayer(player: Player): void {
    this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y));
  }

  private stopMovement(): void {
    this.setVelocity(0, 0);
  }

  private transitionTo(nextState: EnemyState): void {
    if (this.currentAiState === nextState) {
      return;
    }

    this.currentAiState = nextState;
    this.applyStatePresentation();
  }

  private applyStatePresentation(): void {
    this.clearTint();

    switch (this.currentAiState) {
      case EnemyState.Idle:
        this.setAlpha(0.72);
        break;
      case EnemyState.Chase:
        this.setAlpha(1);
        break;
      case EnemyState.Attack:
        this.setAlpha(1);
        this.setTint(0xff8a78);
        break;
      case EnemyState.Dead:
        this.setTint(0x555555);
        break;
    }
  }
}
