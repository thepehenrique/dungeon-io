import Phaser from 'phaser';

import { HUD_COLORS, HUD_LAYOUT } from '../../config/hud';

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
      .rectangle(x, y, width, height, HUD_COLORS.slot, 0.94)
      .setOrigin(0)
      .setStrokeStyle(1, HUD_COLORS.panelBorder);
    const keyText = scene.add.text(x + 9, y + 7, `[${key}]`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: HUD_COLORS.slotKey,
    });
    this.contentText = scene.add
      .text(x + width / 2, y + 38, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: HUD_COLORS.primaryText,
        align: 'center',
        fixedWidth: width - 14,
        wordWrap: { width: width - 14 },
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
