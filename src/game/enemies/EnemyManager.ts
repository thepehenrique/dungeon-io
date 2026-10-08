import Phaser from 'phaser';

import { ENEMY_WAVE_CONFIG, INITIAL_ENEMY_SPAWNS } from '../config/enemies';
import type { Player } from '../player/Player';
import type { VisionBlocker } from '../dungeon/TilemapDungeon';
import { hasLineOfSightBetween } from '../systems/VisionSystem';
import type { EnemySpawnDefinition } from '../types/enemy';
import { Enemy, type EnemyLineOfSightTest } from './Enemy';
import { createEnemy } from './createEnemy';

export class EnemyManager {
  readonly group: Phaser.Physics.Arcade.Group;

  private readonly scene: Phaser.Scene;
  private readonly player: Player;
  private readonly onEnemyAttack: (attacker: Enemy, target: Player) => void;
  private readonly colliders: Phaser.Physics.Arcade.Collider[];
  private readonly spawns: readonly EnemySpawnDefinition[];
  private readonly hasLineOfSight: EnemyLineOfSightTest;

  private waveNumber = 1;
  private nextWaveInMs: number | null = null;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    walls: Phaser.Physics.Arcade.StaticGroup,
    visionBlockers: readonly VisionBlocker[],
    onEnemyAttack: (attacker: Enemy, target: Player) => void,
    spawns: readonly EnemySpawnDefinition[] = INITIAL_ENEMY_SPAWNS,
  ) {
    this.scene = scene;
    this.player = player;
    this.onEnemyAttack = onEnemyAttack;
    this.spawns = spawns;
    this.hasLineOfSight = (originX, originY, targetX, targetY) =>
      hasLineOfSightBetween(
        originX,
        originY,
        targetX,
        targetY,
        visionBlockers,
      );
    this.group = scene.physics.add.group({ allowGravity: false });

    this.spawnWave();

    this.colliders = [
      scene.physics.add.collider(this.group, walls),
      scene.physics.add.collider(this.group, this.group),
      scene.physics.add.collider(player, this.group),
    ];
  }

  update(deltaMs: number): void {
    for (const child of [...this.group.getChildren()]) {
      if (child instanceof Enemy && child.active) {
        child.updateAI(
          this.player,
          this.onEnemyAttack,
          this.hasLineOfSight,
        );
      }
    }

    if (this.hasLivingEnemies()) {
      return;
    }

    if (this.nextWaveInMs === null) {
      this.nextWaveInMs = ENEMY_WAVE_CONFIG.intermissionMs;
      return;
    }

    this.nextWaveInMs = Math.max(0, this.nextWaveInMs - deltaMs);

    if (this.nextWaveInMs === 0) {
      this.waveNumber += 1;
      this.nextWaveInMs = null;
      this.spawnWave();
    }
  }

  get currentWave(): number {
    return this.waveNumber;
  }

  get secondsUntilNextWave(): number | null {
    if (this.nextWaveInMs === null) {
      return null;
    }

    return Math.ceil(this.nextWaveInMs / 1000);
  }

  getEnemies(): readonly Enemy[] {
    return this.group
      .getChildren()
      .filter((child): child is Enemy => child instanceof Enemy);
  }

  destroy(): void {
    for (const collider of this.colliders) {
      collider.destroy();
    }

    this.group.clear(true, true);
  }

  private hasLivingEnemies(): boolean {
    return this.getEnemies().some((enemy) => enemy.active && !enemy.isDead);
  }

  private spawnWave(): void {
    for (const spawn of this.spawns) {
      this.group.add(createEnemy(this.scene, spawn));
    }
  }
}
