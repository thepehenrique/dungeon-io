import Phaser from 'phaser';

import { HUD_COLORS, HUD_LAYOUT } from '../../config/hud';
import { UI_ASSETS } from '../../config/uiAssets';

export class HudQuickSlot {
  private readonly contentText: Phaser.GameObjects.Text;

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
    this.contentText = scene.add
      .text(x + width / 2, y + 38, '', {
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

    container.add([background, keyText, this.contentText]);
  }

  update(content: string): void {
    if (this.contentText.text !== content) {
      this.contentText.setText(content);
    }
  }
}
