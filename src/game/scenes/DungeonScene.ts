import Phaser from 'phaser';

import { COMBAT_BALANCE } from '../config/combat';
import { DUNGEON_SPAWN } from '../config/dungeon';
import { PLAYER_CLASSES } from '../config/playerClasses';
import { PROGRESSION_CONFIG } from '../config/progression';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENE_KEYS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants/game';
import { FixedDungeon } from '../dungeon/FixedDungeon';
import { Enemy } from '../enemies/Enemy';
import { EnemyManager } from '../enemies/EnemyManager';
import { Player } from '../player/Player';
import { PlayerController } from '../player/PlayerController';
import { ProjectileManager } from '../projectiles/ProjectileManager';
import { getGameSession } from '../state/getGameSession';
import { CombatSystem } from '../systems/CombatSystem';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { AttackKind } from '../types/combat';
import type { UpgradeDefinition } from '../types/upgrade';
import { Hud } from '../ui/hud/Hud';
import { createPrimaryWeapon } from '../weapons/createPrimaryWeapon';
import { LevelUpView } from '../../ui/level-up/LevelUpView';

export class DungeonScene extends Phaser.Scene {
  private playerController: PlayerController | null = null;
  private projectileManager: ProjectileManager | null = null;
  private enemyManager: EnemyManager | null = null;
  private player: Player | null = null;
  private hud: Hud | null = null;
  private progressionSystem: ProgressionSystem | null = null;
  private readonly upgradeSystem = new UpgradeSystem();
  private levelUpView: LevelUpView | null = null;
  private readonly pendingUpgradeLevels: number[] = [];
  private isChoosingUpgrade = false;

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
    this.player = player;
    this.progressionSystem = new ProgressionSystem(run, (newLevel) => {
      this.queueLevelUp(newLevel);
    });

    const combatSystem = new CombatSystem((target) => {
      if (target instanceof Enemy) {
        run.kills += 1;
        const experienceReward = target.stats.experienceReward;
        this.showExperienceGain(target.x, target.y, experienceReward);
        this.progressionSystem?.addExperience(experienceReward);
        return;
      }

      if (target instanceof Player) {
        session.finishRun();
        this.time.delayedCall(COMBAT_BALANCE.playerDeathDelayMs, () => {
          this.scene.start(SCENE_KEYS.GAME_OVER);
        });
      }
    });

    this.physics.add.collider(player, dungeon.walls);
    this.enemyManager = new EnemyManager(
      this,
      player,
      dungeon.walls,
      (attacker, target) => {
        combatSystem.applyDamage(target, {
          sourceId: attacker.enemyId,
          amount: attacker.stats.damage,
          attackKind: AttackKind.Melee,
        });
      },
    );
    this.projectileManager = new ProjectileManager(this, dungeon.walls);
    this.projectileManager.registerEnemyTargets(
      this.enemyManager.group,
      (projectile, enemy) => {
        combatSystem.applyDamage(enemy, {
          sourceId: projectile.ownerId,
          amount: projectile.damage,
          attackKind: projectile.attackKind,
        });
      },
    );
    const primaryWeapon = createPrimaryWeapon(
      this,
      player,
      this.projectileManager,
      (attack) => {
        combatSystem.applyMeleeAttack(this.enemyManager?.getEnemies() ?? [], attack);
      },
    );
    this.playerController = new PlayerController(this, player, primaryWeapon);

    this.cameras.main.startFollow(player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(GAME_WIDTH * 0.12, GAME_HEIGHT * 0.12);

    this.hud = new Hud(this, player, run, PLAYER_CLASSES[run.playerClass]);
    this.createDemoExit(() => {
      session.finishRun();
      this.scene.start(SCENE_KEYS.GAME_OVER);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.playerController?.destroy();
      this.projectileManager?.destroy();
      this.enemyManager?.destroy();
      this.levelUpView?.destroy();
      this.hud?.destroy();
      this.resumeAction();
      this.playerController = null;
      this.projectileManager = null;
      this.enemyManager = null;
      this.player = null;
      this.hud = null;
      this.progressionSystem = null;
      this.levelUpView = null;
      this.pendingUpgradeLevels.length = 0;
    });
  }

  update(): void {
    this.hud?.update();

    if (this.isChoosingUpgrade) {
      return;
    }

    this.playerController?.update();
    this.projectileManager?.update();
    this.enemyManager?.update();
  }

  private showExperienceGain(x: number, y: number, amount: number): void {
    const text = this.add
      .text(x, y - 28, `+${amount} XP`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#85d97a',
        stroke: '#071007',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(120);

    this.tweens.add({
      targets: text,
      y: text.y - 32,
      alpha: 0,
      duration: PROGRESSION_CONFIG.experienceTextDurationMs,
      ease: 'Quad.Out',
      onComplete: () => text.destroy(),
    });
  }

  private queueLevelUp(level: number): void {
    this.pendingUpgradeLevels.push(level);

    if (!this.levelUpView) {
      this.showNextUpgradeSelection();
    }
  }

  private showNextUpgradeSelection(): void {
    const level = this.pendingUpgradeLevels.shift();

    if (level === undefined) {
      this.resumeAction();
      return;
    }

    const uiRoot = document.querySelector<HTMLElement>('#ui-root');

    if (!uiRoot || !this.player) {
      throw new Error('Level up UI cannot be created without its root and player.');
    }

    this.pauseAction();
    const choices = this.upgradeSystem.getRandomChoices(
      PROGRESSION_CONFIG.upgradeChoiceCount,
    );
    this.levelUpView = new LevelUpView(uiRoot, level, choices, (upgrade) => {
      this.selectUpgrade(upgrade);
    });
  }

  private selectUpgrade(upgrade: UpgradeDefinition): void {
    if (!this.player || !this.levelUpView) {
      return;
    }

    this.upgradeSystem.apply(upgrade, this.player.stats);
    this.levelUpView.destroy();
    this.levelUpView = null;
    this.showNextUpgradeSelection();
  }

  private pauseAction(): void {
    if (this.isChoosingUpgrade) {
      return;
    }

    this.isChoosingUpgrade = true;
    this.physics.world.pause();
    this.tweens.pauseAll();
  }

  private resumeAction(): void {
    if (!this.isChoosingUpgrade) {
      return;
    }

    this.physics.world.resume();
    this.tweens.resumeAll();
    this.isChoosingUpgrade = false;
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
