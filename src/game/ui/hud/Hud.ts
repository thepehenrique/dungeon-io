import Phaser from 'phaser';

import { HUD_COLORS, HUD_LAYOUT } from '../../config/hud';
import { CONSUMABLE_DEFINITIONS } from '../../config/consumables';
import { GAME_HEIGHT } from '../../constants/game';
import type { PotionSlot } from '../../items/consumables/PotionSlot';
import type { ClassAbilityController } from '../../player/ClassAbilityController';
import type { Player } from '../../player/Player';
import { getRequiredExperience } from '../../systems/ProgressionSystem';
import type { PlayerClassDefinition } from '../../types/player';
import type { RunState } from '../../types/run';
import { HudBar } from './HudBar';
import { HudQuickSlot } from './HudQuickSlot';

export class Hud {
  private readonly container: Phaser.GameObjects.Container;
  private readonly player: Player;
  private readonly run: RunState;
  private readonly potionSlot: PotionSlot;
  private readonly classAbility: ClassAbilityController;
  private readonly levelText: Phaser.GameObjects.Text;
  private readonly killsText: Phaser.GameObjects.Text;
  private readonly goldText: Phaser.GameObjects.Text;
  private readonly quickSlots: readonly HudQuickSlot[];
  private readonly classAbilityText: Phaser.GameObjects.Text;
  private readonly healthBar: HudBar;
  private readonly experienceBar: HudBar;

  private lastHealth = Number.NaN;
  private lastMaxHealth = Number.NaN;
  private lastExperience = Number.NaN;
  private lastLevel = Number.NaN;
  private lastKills = Number.NaN;
  private lastGold = Number.NaN;
  private lastPotionSignature = '';
  private lastAbilityText = '';

  constructor(
    scene: Phaser.Scene,
    player: Player,
    run: RunState,
    playerClass: PlayerClassDefinition,
    potionSlot: PotionSlot,
    classAbility: ClassAbilityController,
  ) {
    this.player = player;
    this.run = run;
    this.potionSlot = potionSlot;
    this.classAbility = classAbility;
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
    const nameText = scene.add.text(HUD_LAYOUT.padding, 12, player.playerName, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: HUD_COLORS.primaryText,
    });
    const classText = scene.add.text(HUD_LAYOUT.padding, 36, playerClass.label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: playerClass.cssColor,
    });
    this.levelText = scene.add
      .text(HUD_LAYOUT.width - HUD_LAYOUT.padding, 14, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#e6c87a',
      })
      .setOrigin(1, 0);
    this.killsText = scene.add.text(HUD_LAYOUT.padding, HUD_LAYOUT.statsY, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: HUD_COLORS.secondaryText,
    });
    this.goldText = scene.add
      .text(HUD_LAYOUT.width - HUD_LAYOUT.padding, HUD_LAYOUT.statsY, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#e6c87a',
      })
      .setOrigin(1, 0);

    this.container.add([
      panel,
      accent,
      nameText,
      classText,
      this.levelText,
      this.killsText,
      this.goldText,
    ]);
    this.healthBar = new HudBar(
      scene,
      this.container,
      HUD_LAYOUT.healthY,
      'HP',
      HUD_COLORS.health,
    );
    this.experienceBar = new HudBar(
      scene,
      this.container,
      HUD_LAYOUT.experienceY,
      'XP',
      HUD_COLORS.experience,
    );

    const quickSlotsY =
      GAME_HEIGHT -
      HUD_LAYOUT.y -
      HUD_LAYOUT.quickSlots.bottom -
      HUD_LAYOUT.quickSlots.height;
    this.quickSlots = [1, 2, 3].map((key, index) => {
      const x =
        index * (HUD_LAYOUT.quickSlots.width + HUD_LAYOUT.quickSlots.gap);

      return new HudQuickSlot(scene, this.container, x, quickSlotsY, key);
    });
    this.quickSlots[1].update('Vazio');
    this.quickSlots[2].update('Vazio');

    const abilityX =
      HUD_LAYOUT.quickSlots.width * 3 +
      HUD_LAYOUT.quickSlots.gap * 2 +
      HUD_LAYOUT.ability.gap;
    const abilityBackground = scene.add
      .rectangle(
        abilityX,
        quickSlotsY,
        HUD_LAYOUT.ability.width,
        HUD_LAYOUT.ability.height,
        HUD_COLORS.slot,
        0.94,
      )
      .setOrigin(0)
      .setStrokeStyle(1, playerClass.color);
    const abilityLabel = scene.add.text(abilityX + 11, quickSlotsY + 8, 'HABILIDADE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: HUD_COLORS.mutedText,
    });
    this.classAbilityText = scene.add
      .text(
        abilityX + 11,
        quickSlotsY + 31,
        '',
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: playerClass.cssColor,
          fixedWidth: HUD_LAYOUT.ability.width - 22,
        },
      );
    this.container.add([
      abilityBackground,
      abilityLabel,
      this.classAbilityText,
    ]);

    this.update();
  }

  update(): void {
    const potionSignature = `${this.potionSlot.type ?? 'EMPTY'}:${this.potionSlot.quantity}`;
    const abilityText = this.classAbility.hudText;

    if (
      this.player.stats.health !== this.lastHealth ||
      this.player.stats.maxHealth !== this.lastMaxHealth
    ) {
      this.lastHealth = this.player.stats.health;
      this.lastMaxHealth = this.player.stats.maxHealth;
      this.healthBar.update(this.player.stats.health, this.player.stats.maxHealth);
    }

    if (
      this.run.experience !== this.lastExperience ||
      this.run.level !== this.lastLevel
    ) {
      this.lastExperience = this.run.experience;
      this.experienceBar.update(
        this.run.experience,
        getRequiredExperience(this.run.level),
      );
    }

    if (this.run.level !== this.lastLevel) {
      this.lastLevel = this.run.level;
      this.levelText.setText(`LV ${this.run.level}`);
    }

    if (this.run.kills !== this.lastKills) {
      this.lastKills = this.run.kills;
      this.killsText.setText(`Kills: ${this.run.kills}`);
    }

    if (this.run.gold !== this.lastGold) {
      this.lastGold = this.run.gold;
      this.goldText.setText(`Ouro: ${this.run.gold}`);
    }

    if (potionSignature !== this.lastPotionSignature) {
      this.lastPotionSignature = potionSignature;
      const potionType = this.potionSlot.type;
      this.quickSlots[0].update(
        potionType === null
          ? 'Vazio'
          : `${CONSUMABLE_DEFINITIONS[potionType].name} x${this.potionSlot.quantity}`,
      );
    }

    if (abilityText !== this.lastAbilityText) {
      this.lastAbilityText = abilityText;
      this.classAbilityText.setText(abilityText);
    }
  }

  destroy(): void {
    this.container.destroy();
  }
}
