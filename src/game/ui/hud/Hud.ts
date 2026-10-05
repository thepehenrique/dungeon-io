import Phaser from 'phaser';

import { HUD_COLORS, HUD_LAYOUT } from '../../config/hud';
import { getItemDefinition } from '../../items/ItemRegistry';
import type { ClassAbilityController } from '../../player/ClassAbilityController';
import type { Player } from '../../player/Player';
import type { InventorySystem } from '../../systems/InventorySystem';
import { getRequiredExperience } from '../../systems/ProgressionSystem';
import type { PlayerClassDefinition } from '../../types/player';
import type { RunState } from '../../types/run';
import { HudBar } from './HudBar';
import { HudQuickSlot } from './HudQuickSlot';

export class Hud {
  private readonly topContainer: Phaser.GameObjects.Container;
  private readonly actionContainer: Phaser.GameObjects.Container;
  private readonly scaleManager: Phaser.Scale.ScaleManager;
  private readonly player: Player;
  private readonly run: RunState;
  private readonly inventory: InventorySystem;
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
  private lastQuickSlotSignature = '';
  private lastAbilityText = '';

  constructor(
    scene: Phaser.Scene,
    player: Player,
    run: RunState,
    playerClass: PlayerClassDefinition,
    inventory: InventorySystem,
    classAbility: ClassAbilityController,
  ) {
    this.player = player;
    this.run = run;
    this.inventory = inventory;
    this.classAbility = classAbility;
    this.scaleManager = scene.scale;
    this.topContainer = scene.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(500);
    this.actionContainer = scene.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(500);

    const panel = scene.add
      .rectangle(0, 0, HUD_LAYOUT.width, HUD_LAYOUT.height, HUD_COLORS.panel, 0.92)
      .setOrigin(0)
      .setStrokeStyle(1, HUD_COLORS.panelBorder);
    const accent = scene.add
      .rectangle(0, 0, 5, HUD_LAYOUT.height, playerClass.color)
      .setOrigin(0);
    const nameText = scene.add.text(HUD_LAYOUT.padding, 11, player.playerName, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: HUD_COLORS.primaryText,
      fixedWidth: 190,
    });
    const classText = scene.add.text(218, 15, playerClass.label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: playerClass.cssColor,
    });
    this.levelText = scene.add
      .text(HUD_LAYOUT.width - HUD_LAYOUT.padding, 13, '', {
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

    this.topContainer.add([
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
      this.topContainer,
      HUD_LAYOUT.healthY,
      'HP',
      HUD_COLORS.health,
    );
    this.experienceBar = new HudBar(
      scene,
      this.topContainer,
      HUD_LAYOUT.experienceY,
      'XP',
      HUD_COLORS.experience,
    );

    this.quickSlots = [1, 2, 3].map((key, index) => {
      const x =
        index * (HUD_LAYOUT.quickSlots.width + HUD_LAYOUT.quickSlots.gap);

      return new HudQuickSlot(scene, this.actionContainer, x, 0, key);
    });
    const abilityX =
      HUD_LAYOUT.quickSlots.width * 3 +
      HUD_LAYOUT.quickSlots.gap * 2 +
      HUD_LAYOUT.ability.gap;
    const abilityBackground = scene.add
      .rectangle(
        abilityX,
        0,
        HUD_LAYOUT.ability.width,
        HUD_LAYOUT.ability.height,
        HUD_COLORS.slot,
        0.94,
      )
      .setOrigin(0)
      .setStrokeStyle(1, playerClass.color);
    const abilityLabel = scene.add.text(abilityX + 11, 8, 'HABILIDADE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: HUD_COLORS.mutedText,
    });
    this.classAbilityText = scene.add
      .text(
        abilityX + 11,
        31,
        '',
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: playerClass.cssColor,
          fixedWidth: HUD_LAYOUT.ability.width - 22,
        },
      );
    this.actionContainer.add([
      abilityBackground,
      abilityLabel,
      this.classAbilityText,
    ]);

    this.scaleManager.on(
      Phaser.Scale.Events.RESIZE,
      this.handleResize,
      this,
    );
    this.reposition();
    this.update();
  }

  update(): void {
    const quickSlotSignature = [0, 1, 2]
      .map((index) => {
        const definitionId = this.inventory.getQuickSlotDefinitionId(index);
        return `${definitionId ?? 'EMPTY'}:${definitionId ? this.inventory.getQuantity(definitionId) : 0}`;
      })
      .join('|');
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

    if (quickSlotSignature !== this.lastQuickSlotSignature) {
      this.lastQuickSlotSignature = quickSlotSignature;

      for (let index = 0; index < this.quickSlots.length; index += 1) {
        const definitionId = this.inventory.getQuickSlotDefinitionId(index);
        const definition = definitionId
          ? getItemDefinition(definitionId)
          : null;
        this.quickSlots[index].update(
          definition
            ? `${definition.name} x${this.inventory.getQuantity(definition.id)}`
            : 'Vazio',
        );
      }
    }

    if (abilityText !== this.lastAbilityText) {
      this.lastAbilityText = abilityText;
      this.classAbilityText.setText(abilityText);
    }
  }

  destroy(): void {
    this.scaleManager.off(
      Phaser.Scale.Events.RESIZE,
      this.handleResize,
      this,
    );
    this.topContainer.destroy();
    this.actionContainer.destroy();
  }

  private handleResize(): void {
    this.reposition();
  }

  private reposition(): void {
    const viewportWidth = this.scaleManager.gameSize.width;
    const viewportHeight = this.scaleManager.gameSize.height;
    const availableWidth = Math.max(
      1,
      viewportWidth - HUD_LAYOUT.sideMargin * 2,
    );
    const topScale = Math.min(1, availableWidth / HUD_LAYOUT.width);
    const actionWidth =
      HUD_LAYOUT.quickSlots.width * 3 +
      HUD_LAYOUT.quickSlots.gap * 2 +
      HUD_LAYOUT.ability.gap +
      HUD_LAYOUT.ability.width;
    const actionScale = Math.min(1, availableWidth / actionWidth);

    this.topContainer
      .setScale(topScale)
      .setPosition(
        (viewportWidth - HUD_LAYOUT.width * topScale) / 2,
        HUD_LAYOUT.topMargin,
      );
    this.actionContainer
      .setScale(actionScale)
      .setPosition(
        (viewportWidth - actionWidth * actionScale) / 2,
        viewportHeight -
          HUD_LAYOUT.quickSlots.bottom -
          HUD_LAYOUT.quickSlots.height * actionScale,
      );
  }
}
