import Phaser from 'phaser';

import { HUD_COLORS, HUD_LAYOUT } from '../../config/hud';
import { UI_ASSETS } from '../../config/uiAssets';

export class HudQuickSlot {
  private readonly contentText: Phaser.GameObjects.Text;
  private readonly icon: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    key: number,
  ) {
    const { width, height } = HUD_LAYOUT.quickSlots;
    const background = scene.add
      .image(x, y, UI_ASSETS.slot.key)
      .setOrigin(0)
      .setDisplaySize(width, height);
    const keyText = scene.add.text(x + 8, y + 6, `[${key}]`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: HUD_COLORS.slotKey,
      stroke: '#080a0d',
      strokeThickness: 2,
    });
    this.icon = scene.add
      .image(x + width / 2, y + height / 2 - 2, '__WHITE')
      .setVisible(false);
    this.contentText = scene.add
      .text(x + width / 2, y + 45, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '9px',
        fontStyle: 'bold',
        color: HUD_COLORS.primaryText,
        align: 'center',
        fixedWidth: width - 12,
        wordWrap: { width: width - 12 },
        stroke: '#080a0d',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    container.add([background, this.icon, keyText, this.contentText]);
  }

  update(content: string, textureKey: string | null = null): void {
    if (textureKey) {
      this.icon
        .setTexture(textureKey)
        .setDisplaySize(28, 28)
        .setVisible(true);
    } else {
      this.icon.setVisible(false);
    }

    if (this.contentText.text !== content) {
      this.contentText.setText(content);
    }
  }
}
