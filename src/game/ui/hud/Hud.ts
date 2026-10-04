import Phaser from 'phaser';

import { HUD_COLORS, HUD_LAYOUT } from '../../config/hud';
import { GAME_HEIGHT } from '../../constants/game';
import type { Player } from '../../player/Player';
import type { EquipmentSystem } from '../../systems/EquipmentSystem';
import { getRequiredExperience } from '../../systems/ProgressionSystem';
import type { PlayerClassDefinition } from '../../types/player';
import type { RunState } from '../../types/run';
import { HudBar } from './HudBar';

export class Hud {
  private readonly container: Phaser.GameObjects.Container;
  private readonly player: Player;
  private readonly run: RunState;
  private readonly equipmentSystem: EquipmentSystem;
  private readonly levelText: Phaser.GameObjects.Text;
  private readonly killsText: Phaser.GameObjects.Text;
  private readonly equipmentText: Phaser.GameObjects.Text;
  private readonly healthBar: HudBar;
  private readonly experienceBar: HudBar;

  private lastHealth = Number.NaN;
  private lastMaxHealth = Number.NaN;
  private lastExperience = Number.NaN;
  private lastLevel = Number.NaN;
  private lastKills = Number.NaN;
  private lastGold = Number.NaN;
  private lastEquipmentSignature = '';

  constructor(
    scene: Phaser.Scene,
    player: Player,
    run: RunState,
    playerClass: PlayerClassDefinition,
    equipmentSystem: EquipmentSystem,
  ) {
    this.player = player;
    this.run = run;
    this.equipmentSystem = equipmentSystem;
    this.container = scene.add
      .container(HUD_LAYOUT.x, HUD_LAYOUT.y)
      .setScrollFactor(0)
      .setDepth(500);

    const panel = scene.add
      .rectangle(0, 0, HUD_LAYOUT.width, HUD_LAYOUT.height, HUD_COLORS.panel, 0.92)
      .setOrigin(0)
      .setStrokeStyle(1, HUD_COLORS.panelBorder);
    const accent = scene.add
      .rectangle(0, 0, 5, HUD_LAYOUT.height, playerClass.color)
      .setOrigin(0);
    const nameText = scene.add.text(HUD_LAYOUT.padding, 14, player.playerName, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: HUD_COLORS.primaryText,
    });
    const classText = scene.add.text(HUD_LAYOUT.padding, 42, playerClass.label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: playerClass.cssColor,
    });
    this.levelText = scene.add
      .text(HUD_LAYOUT.width - HUD_LAYOUT.padding, 16, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#e6c87a',
      })
      .setOrigin(1, 0);
    this.killsText = scene.add.text(HUD_LAYOUT.padding, 181, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: HUD_COLORS.secondaryText,
    });
    this.equipmentText = scene.add.text(HUD_LAYOUT.padding, 207, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: HUD_COLORS.mutedText,
    });

    this.container.add([panel, accent, nameText, classText, this.levelText]);
    this.healthBar = new HudBar(scene, this.container, 70, 'VIDA', HUD_COLORS.health);
    this.experienceBar = new HudBar(
      scene,
      this.container,
      126,
      'EXPERIÊNCIA',
      HUD_COLORS.experience,
    );
    this.container.add([this.killsText, this.equipmentText]);

    const controlsText = scene.add
      .text(
        0,
        GAME_HEIGHT - HUD_LAYOUT.y - 24,
        'WASD mover  ·  Mouse mirar  ·  Clique esquerdo atacar',
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          color: HUD_COLORS.mutedText,
          backgroundColor: '#080c12cc',
          padding: { x: 10, y: 7 },
        },
      )
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(500);
    this.container.add(controlsText);

    this.update();
  }

  update(): void {
    const equippedItems = this.equipmentSystem.getEquippedItems();
    const equipmentSignature = equippedItems.map((item) => item.id).join('|');

    if (
      this.player.stats.health === this.lastHealth &&
      this.player.stats.maxHealth === this.lastMaxHealth &&
      this.run.experience === this.lastExperience &&
      this.run.level === this.lastLevel &&
      this.run.kills === this.lastKills &&
      this.run.gold === this.lastGold &&
      equipmentSignature === this.lastEquipmentSignature
    ) {
      return;
    }

    this.lastHealth = this.player.stats.health;
    this.lastMaxHealth = this.player.stats.maxHealth;
    this.lastExperience = this.run.experience;
    this.lastLevel = this.run.level;
    this.lastKills = this.run.kills;
    this.lastGold = this.run.gold;
    this.lastEquipmentSignature = equipmentSignature;

    this.levelText.setText(`LV ${this.run.level}`);
    this.killsText.setText(
      `Inimigos derrotados: ${this.run.kills}  ·  Ouro: ${this.run.gold}`,
    );
    this.equipmentText.setText(
      equippedItems.length > 0
        ? `Equipado: ${equippedItems.map((item) => item.label).join(' · ')}`
        : 'Equipado: nenhum',
    );
    this.healthBar.update(this.player.stats.health, this.player.stats.maxHealth);
    this.experienceBar.update(
      this.run.experience,
      getRequiredExperience(this.run.level),
    );
  }

  destroy(): void {
    this.container.destroy();
  }
}
