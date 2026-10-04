import Phaser from 'phaser';

import { DUNGEON_SPAWN } from '../config/dungeon';
import { PLAYER_CLASSES } from '../config/playerClasses';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENE_KEYS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants/game';
import { FixedDungeon } from '../dungeon/FixedDungeon';
import { EnemyManager } from '../enemies/EnemyManager';
import { Player } from '../player/Player';
import { PlayerController } from '../player/PlayerController';
import { ProjectileManager } from '../projectiles/ProjectileManager';
import { getGameSession } from '../state/getGameSession';
import { createPrimaryWeapon } from '../weapons/createPrimaryWeapon';

export class DungeonScene extends Phaser.Scene {
  private playerController: PlayerController | null = null;
  private projectileManager: ProjectileManager | null = null;
  private enemyManager: EnemyManager | null = null;

  constructor() {
    super(SCENE_KEYS.DUNGEON);
  }

  create(): void {
    const session = getGameSession(this);
    const run = session.getRun();

    if (!run) {
      this.scene.start(SCENE_KEYS.MENU);
      return;
    }

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const dungeon = new FixedDungeon(this);
    dungeon.create();

    const player = new Player(this, DUNGEON_SPAWN.x, DUNGEON_SPAWN.y, {
      id: run.playerId,
      name: run.playerName,
      playerClass: run.playerClass,
    });

    this.physics.add.collider(player, dungeon.walls);
    this.enemyManager = new EnemyManager(this, player, dungeon.walls);
    this.projectileManager = new ProjectileManager(this, dungeon.walls);
    const primaryWeapon = createPrimaryWeapon(this, player, this.projectileManager);
    this.playerController = new PlayerController(this, player, primaryWeapon);

    this.cameras.main.startFollow(player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(GAME_WIDTH * 0.12, GAME_HEIGHT * 0.12);

    this.createRunInfo(player, PLAYER_CLASSES[run.playerClass].label);
    this.createDemoExit(() => {
      session.finishRun();
      this.scene.start(SCENE_KEYS.GAME_OVER);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.playerController?.destroy();
      this.projectileManager?.destroy();
      this.enemyManager?.destroy();
      this.playerController = null;
      this.projectileManager = null;
      this.enemyManager = null;
    });
  }

  update(): void {
    this.playerController?.update();
    this.projectileManager?.update();
    this.enemyManager?.update();
  }

  private createRunInfo(player: Player, className: string): void {
    this.add
      .text(28, 24, `${player.playerName} · ${className}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#f4f5f7',
        backgroundColor: '#0a0d12cc',
        padding: { x: 14, y: 10 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .text(
        28,
        78,
        [
          `HP ${player.stats.health}/${player.stats.maxHealth}`,
          `Dano ${player.stats.damage} · Defesa ${player.stats.defense}`,
          `Movimento ${player.stats.movementSpeed} · Ataques/s ${player.stats.attackSpeed}`,
          `Alcance ${player.stats.attackRange}`,
          '',
          'WASD para mover · mouse para mirar',
          'Clique esquerdo para atacar',
          'Inimigos vermelhos estão em alcance de ataque',
        ].join('\n'),
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
          color: '#a9b4c1',
          lineSpacing: 5,
        },
      )
      .setScrollFactor(0)
      .setDepth(100);
  }

  private createDemoExit(onExit: () => void): void {
    this.add
      .text(GAME_WIDTH - 28, 24, 'FINALIZAR DEMONSTRAÇÃO', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        color: '#e6c87a',
        backgroundColor: '#202b38',
        padding: { x: 16, y: 11 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, onExit);
  }
}
