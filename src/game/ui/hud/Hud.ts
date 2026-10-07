import Phaser from 'phaser';

import { HUD_COLORS, HUD_LAYOUT } from '../../config/hud';
import { RUN_OBJECTIVE_CONFIG } from '../../config/runObjective';
import { UI_ASSETS } from '../../config/uiAssets';
import { getItemDefinition } from '../../items/ItemRegistry';
import { OBJECTIVE_TEXTURE_KEYS } from '../../objectives/objectiveTextures';
import type { ClassAbilityController } from '../../player/ClassAbilityController';
import type { Player } from '../../player/Player';
import type { InventorySystem } from '../../systems/InventorySystem';
import { getRequiredExperience } from '../../systems/ProgressionSystem';
import { ItemType } from '../../types/item';
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
  private readonly timerFrame: Phaser.GameObjects.Image;
  private readonly timeText: Phaser.GameObjects.Text;
  private readonly keyIcon: Phaser.GameObjects.Image;
  private readonly quickSlots: readonly HudQuickSlot[];
  private readonly classAbilityText: Phaser.GameObjects.Text;
  private readonly healthBar: HudBar;
  private readonly experienceBar: HudBar;

  private lastHealth = Number.NaN;
  private lastMaxHealth = Number.NaN;
  private lastExperience = Number.NaN;
  private lastLevel = Number.NaN;
  private lastQuickSlotSignature = '';
  private lastAbilityText = '';
  private lastTimerSignature = '';

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

    this.healthBar = new HudBar(
      scene,
      this.topContainer,
      HUD_LAYOUT.healthBar,
      UI_ASSETS.healthBar.key,
      'HP',
      HUD_COLORS.health,
    );
    this.experienceBar = new HudBar(
      scene,
      this.topContainer,
      HUD_LAYOUT.experienceBar,
      UI_ASSETS.experienceBar.key,
      'XP',
      HUD_COLORS.experience,
    );
    this.levelText = scene.add
      .text(HUD_LAYOUT.level.x, HUD_LAYOUT.level.y, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#e6c87a',
        stroke: '#080a0d',
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5);
    this.timerFrame = scene.add
      .image(HUD_LAYOUT.timer.x, HUD_LAYOUT.timer.y, UI_ASSETS.timer.key)
      .setOrigin(0)
      .setDisplaySize(HUD_LAYOUT.timer.width, HUD_LAYOUT.timer.height);
    this.timeText = scene.add
      .text(
        HUD_LAYOUT.timer.x + HUD_LAYOUT.timer.width / 2,
        HUD_LAYOUT.timer.y + HUD_LAYOUT.timer.height / 2,
        '',
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: HUD_COLORS.primaryText,
          stroke: '#080a0d',
          strokeThickness: 3,
        },
      )
      .setOrigin(0.5);
    this.keyIcon = scene.add
      .image(HUD_LAYOUT.key.x, HUD_LAYOUT.key.y, OBJECTIVE_TEXTURE_KEYS.dungeonKey)
      .setOrigin(0)
      .setDisplaySize(HUD_LAYOUT.key.width, HUD_LAYOUT.key.height)
      .setVisible(false);
    this.topContainer.add([
      this.levelText,
      this.timerFrame,
      this.timeText,
      this.keyIcon,
    ]);

    this.quickSlots = [1, 2, 3].map((key, index) => {
      const x =
        HUD_LAYOUT.quickSlots.startX +
        index * (HUD_LAYOUT.quickSlots.width + HUD_LAYOUT.quickSlots.gap);

      return new HudQuickSlot(
        scene,
        this.actionContainer,
        x,
        HUD_LAYOUT.quickSlots.y,
        key,
      );
    });
    const abilityBackground = scene.add
      .image(HUD_LAYOUT.ability.x, HUD_LAYOUT.ability.y, UI_ASSETS.abilitySlot.key)
      .setOrigin(0)
      .setDisplaySize(HUD_LAYOUT.ability.width, HUD_LAYOUT.ability.height);
    const abilityLabel = scene.add
      .text(
        HUD_LAYOUT.ability.x + HUD_LAYOUT.ability.width / 2,
        HUD_LAYOUT.ability.y + 13,
        'SPACE',
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '9px',
          fontStyle: 'bold',
          color: HUD_COLORS.slotKey,
          stroke: '#080a0d',
          strokeThickness: 2,
        },
      )
      .setOrigin(0.5);
    this.classAbilityText = scene.add
      .text(
        HUD_LAYOUT.ability.x + HUD_LAYOUT.ability.width / 2,
        HUD_LAYOUT.ability.y + 40,
        '',
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '9px',
          fontStyle: 'bold',
          color: playerClass.cssColor,
          align: 'center',
          fixedWidth: HUD_LAYOUT.ability.width - 16,
          wordWrap: { width: HUD_LAYOUT.ability.width - 16 },
          stroke: '#080a0d',
          strokeThickness: 2,
        },
      )
      .setOrigin(0.5);
    this.actionContainer.add([
      abilityBackground,
      abilityLabel,
      this.classAbilityText,
    ]);

    this.scaleManager.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
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
    const timerSignature = [
      this.run.hasDungeonKey,
      Math.ceil(this.run.remainingTimeMs / 1000),
    ].join('|');

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

    if (quickSlotSignature !== this.lastQuickSlotSignature) {
      this.lastQuickSlotSignature = quickSlotSignature;

      for (let index = 0; index < this.quickSlots.length; index += 1) {
        const definitionId = this.inventory.getQuickSlotDefinitionId(index);
        const definition = definitionId
          ? getItemDefinition(definitionId)
          : null;
        this.quickSlots[index].update(
          definition
            ? `x${this.inventory.getQuantity(definition.id)}`
            : '—',
          definition?.type === ItemType.Consumable
            ? definition.textureKey
            : null,
        );
      }
    }

    if (abilityText !== this.lastAbilityText) {
      this.lastAbilityText = abilityText;
      this.classAbilityText.setText(
        abilityText.replace(/^\[SPACE\]\s*/, ''),
      );
    }

    if (timerSignature !== this.lastTimerSignature) {
      this.lastTimerSignature = timerSignature;
      const urgent =
        this.run.remainingTimeMs <= RUN_OBJECTIVE_CONFIG.urgentTimeThresholdMs;
      this.timeText
        .setText(formatRemainingTime(this.run.remainingTimeMs))
        .setFontSize(urgent ? 16 : 13)
        .setColor(urgent ? '#ff6b62' : '#f4f5f7');
      this.timerFrame.setTint(urgent ? 0xff7770 : 0xffffff);
      this.keyIcon.setVisible(this.run.hasDungeonKey);
    }
  }

  destroy(): void {
    this.scaleManager.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.topContainer.destroy();
    this.actionContainer.destroy();
  }

  private handleResize(): void {
    this.reposition();
  }

  private reposition(): void {
    const viewportWidth = this.scaleManager.gameSize.width;
    const viewportHeight = this.scaleManager.gameSize.height;
    const topScale = Math.min(1, viewportWidth / HUD_LAYOUT.width);
    const actionScale = Math.min(
      1,
      (viewportWidth - HUD_LAYOUT.sideMargin * 2) / HUD_LAYOUT.actionWidth,
    );

    this.topContainer
      .setScale(topScale)
      .setPosition(
        (viewportWidth - HUD_LAYOUT.width * topScale) / 2,
        HUD_LAYOUT.topMargin,
      );
    this.actionContainer
      .setScale(actionScale)
      .setPosition(
        (viewportWidth - HUD_LAYOUT.actionWidth * actionScale) / 2,
        viewportHeight -
          HUD_LAYOUT.quickSlots.bottom -
          HUD_LAYOUT.actionHeight * actionScale,
      );
  }
}

function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
