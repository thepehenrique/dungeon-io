import Phaser from 'phaser';

import { COMBAT_BALANCE } from '../config/combat';
import { DUNGEON_STYLE } from '../config/dungeon';
import { CONSUMABLE_PRESENTATION } from '../config/consumables';
import { LOOT_PRESENTATION } from '../config/loot';
import { PLAYER_CLASSES } from '../config/playerClasses';
import { PROGRESSION_CONFIG } from '../config/progression';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENE_KEYS,
} from '../constants/game';
import { TilemapDungeon } from '../dungeon/TilemapDungeon';
import { Enemy } from '../enemies/Enemy';
import { EnemyManager } from '../enemies/EnemyManager';
import { ChestManager } from '../items/chests/ChestManager';
import { ConsumableManager } from '../items/consumables/ConsumableManager';
import { PotionSlot } from '../items/consumables/PotionSlot';
import { Player } from '../player/Player';
import { PlayerController } from '../player/PlayerController';
import { ProjectileManager } from '../projectiles/ProjectileManager';
import { getGameSession } from '../state/getGameSession';
import { CombatSystem } from '../systems/CombatSystem';
import { EquipmentSystem } from '../systems/EquipmentSystem';
import { LootSystem } from '../systems/LootSystem';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import {
  AttackKind,
  type Damageable,
  type DamageResult,
} from '../types/combat';
import { LootDelivery } from '../types/loot';
import type { UpgradeDefinition } from '../types/upgrade';
import { RunEndReason } from '../types/run';
import { Hud } from '../ui/hud/Hud';
import { createPrimaryWeapon } from '../weapons/createPrimaryWeapon';
import { LevelUpView } from '../../ui/level-up/LevelUpView';

export class DungeonScene extends Phaser.Scene {
  private playerController: PlayerController | null = null;
  private projectileManager: ProjectileManager | null = null;
  private consumableManager: ConsumableManager | null = null;
  private enemyManager: EnemyManager | null = null;
  private player: Player | null = null;
  private hud: Hud | null = null;
  private waveCountdownText: Phaser.GameObjects.Text | null = null;
  private progressionSystem: ProgressionSystem | null = null;
  private readonly upgradeSystem = new UpgradeSystem();
  private readonly lootSystem = new LootSystem();
  private levelUpView: LevelUpView | null = null;
  private readonly pendingUpgradeLevels: number[] = [];
  private isChoosingUpgrade = false;
  private gameOverPending = false;

  constructor() {
    super(SCENE_KEYS.DUNGEON);
  }

  create(): void {
    this.gameOverPending = false;
    const session = getGameSession(this);
    const run = session.getRun();

    if (!run) {
      this.scene.start(SCENE_KEYS.MENU);
      return;
    }

    const dungeon = new TilemapDungeon(this);
    dungeon.create();
    this.physics.world.setBounds(0, 0, dungeon.width, dungeon.height);
    this.cameras.main.setBounds(0, 0, dungeon.width, dungeon.height);

    const playerSpawn = dungeon.getPlayerSpawn();

    const player = new Player(this, playerSpawn.x, playerSpawn.y, {
      id: run.playerId,
      name: run.playerName,
      playerClass: run.playerClass,
    });
    this.player = player;
    this.progressionSystem = new ProgressionSystem(run, (newLevel) => {
      this.queueLevelUp(newLevel);
    });

    const combatSystem = new CombatSystem(
      this,
      (target) => {
        if (target instanceof Enemy) {
          run.kills += 1;
          const experienceReward = target.stats.experienceReward;
          this.showExperienceGain(target.x, target.y, experienceReward);
          this.progressionSystem?.addExperience(experienceReward);
          return;
        }

        if (target instanceof Player) {
          if (this.gameOverPending) {
            return;
          }

          session.finishRun(RunEndReason.Defeated);
          this.gameOverPending = true;
        }
      },
      (target, result, request) => {
        this.showDamageFeedback(target, result);

        if (result.critical || request.attackKind === AttackKind.Melee) {
          this.cameras.main.shake(
            COMBAT_BALANCE.impactShakeDurationMs,
            COMBAT_BALANCE.impactShakeIntensity,
          );
        }
      },
    );

    this.physics.add.collider(player, dungeon.walls);
    const equipmentSystem = new EquipmentSystem(player);
    const potionSlot = new PotionSlot(run.potionSlot);
    this.consumableManager = new ConsumableManager(
      this,
      player,
      potionSlot,
      ({ x, y, color, message, slotChanged }) => {
        if (slotChanged) {
          this.hud?.update();
        }

        this.showLootFeedback(x, y, message, color);
      },
    );
    new ChestManager(
      this,
      player,
      (chest) => {
        const lootResult = this.lootSystem.collectChestLoot(chest.rarity, {
          playerClass: player.playerClass,
          run,
          equipEquipment: (equipment) => equipmentSystem.equip(equipment),
        });

        if (lootResult.delivery === LootDelivery.Pickup) {
          this.consumableManager?.spawn(
            lootResult.consumableType,
            chest.x + CONSUMABLE_PRESENTATION.chestDropOffsetX,
            chest.y + CONSUMABLE_PRESENTATION.chestDropOffsetY,
          );
          return;
        }

        this.showLootFeedback(
          chest.x,
          chest.y,
          lootResult.message,
          lootResult.drop.definition.color,
        );
      },
      dungeon.getChestSpawns(),
    );
    this.enemyManager = new EnemyManager(
      this,
      player,
      dungeon.walls,
      (attacker, target) => {
        combatSystem.applyDamage(target, {
          sourceId: attacker.enemyId,
          amount: attacker.stats.damage,
          attackKind: AttackKind.Melee,
          sourcePosition: new Phaser.Math.Vector2(attacker.x, attacker.y),
        });
      },
      dungeon.getEnemySpawns(),
    );
    this.waveCountdownText = this.add
      .text(GAME_WIDTH / 2, 42, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#f4d17a',
        stroke: '#080c12',
        strokeThickness: 5,
        backgroundColor: '#080c12cc',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(500)
      .setVisible(false);
    this.projectileManager = new ProjectileManager(this, dungeon.walls);
    this.projectileManager.registerEnemyTargets(
      this.enemyManager.group,
      (projectile, enemy) => {
        combatSystem.applyDamage(enemy, {
          sourceId: projectile.ownerId,
          amount: projectile.damage,
          attackKind: projectile.attackKind,
          sourcePosition: new Phaser.Math.Vector2(projectile.x, projectile.y),
          critical: projectile.critical,
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
    this.playerController = new PlayerController(
      this,
      player,
      primaryWeapon,
      () => {
        const result = potionSlot.use(player);

        if (!result) {
          return;
        }

        this.hud?.update();
        this.showLootFeedback(
          player.x,
          player.y,
          result.message,
          result.consumed
            ? result.definition.color
            : CONSUMABLE_PRESENTATION.fullHealthColor,
        );
      },
    );

    this.cameras.main.startFollow(player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(GAME_WIDTH * 0.12, GAME_HEIGHT * 0.12);
    this.cameras.main.fadeIn(DUNGEON_STYLE.cameraFadeDurationMs, 4, 5, 8);

    this.hud = new Hud(
      this,
      player,
      run,
      PLAYER_CLASSES[run.playerClass],
      potionSlot,
      this.playerController.classAbility,
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.levelUpView?.destroy();
      this.consumableManager?.destroy();
      this.playerController?.destroy();
      this.playerController = null;
      this.projectileManager = null;
      this.consumableManager = null;
      this.enemyManager = null;
      this.player = null;
      this.hud = null;
      this.waveCountdownText = null;
      this.progressionSystem = null;
      this.levelUpView = null;
      this.pendingUpgradeLevels.length = 0;
      this.isChoosingUpgrade = false;
      this.gameOverPending = false;
    });
  }

  update(_time: number, delta: number): void {
    this.hud?.update();

    if (this.gameOverPending) {
      this.scene.start(SCENE_KEYS.GAME_OVER);
      return;
    }

    if (this.isChoosingUpgrade) {
      return;
    }

    this.playerController?.update(delta);
    this.projectileManager?.update();
    this.enemyManager?.update(delta);
    this.updateWaveCountdown();

    if (this.gameOverPending) {
      this.scene.start(SCENE_KEYS.GAME_OVER);
    }
  }

  private updateWaveCountdown(): void {
    if (!this.waveCountdownText || !this.enemyManager) {
      return;
    }

    const seconds = this.enemyManager.secondsUntilNextWave;

    if (seconds === null) {
      this.waveCountdownText.setVisible(false);
      return;
    }

    this.waveCountdownText
      .setText(`Horda ${this.enemyManager.currentWave + 1} em ${seconds}s`)
      .setVisible(true);
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

  private showDamageFeedback(
    target: Damageable,
    result: DamageResult,
  ): void {
    const prefix = result.critical ? 'CRIT ' : '';
    const color = result.critical
      ? '#ffd36a'
      : result.damageReductionApplied
        ? '#80c9ff'
        : '#f4f5f7';
    const text = this.add
      .text(target.x, target.y - 30, `${prefix}${result.appliedDamage}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: result.critical ? '20px' : '17px',
        fontStyle: 'bold',
        color,
        stroke: '#080a0d',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(140);

    this.tweens.add({
      targets: text,
      y: text.y - COMBAT_BALANCE.damageTextRise,
      alpha: 0,
      duration: COMBAT_BALANCE.damageTextDurationMs,
      ease: 'Quad.Out',
      onComplete: () => text.destroy(),
    });
  }

  private showLootFeedback(
    x: number,
    y: number,
    message: string,
    color: string,
  ): void {
    const text = this.add
      .text(x, y - 42, message, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color,
        stroke: '#080a0d',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(130);

    this.tweens.add({
      targets: text,
      y: text.y - 34,
      alpha: 0,
      duration: LOOT_PRESENTATION.collectionTextDurationMs,
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
    this.playerController?.classAbility.suspend();
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

}
