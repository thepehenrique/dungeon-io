import Phaser from 'phaser';

import { HUD_COLORS, HUD_LAYOUT } from '../../config/hud';

export class HudBar {
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly valueText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    y: number,
    label: string,
    color: number,
  ) {
    const labelText = scene.add.text(HUD_LAYOUT.padding, y, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: HUD_COLORS.secondaryText,
    });
    this.valueText = scene.add
      .text(HUD_LAYOUT.width - HUD_LAYOUT.padding, y, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: HUD_COLORS.primaryText,
      })
      .setOrigin(1, 0);

    const barY = y + 25;
    const background = scene.add
      .rectangle(
        HUD_LAYOUT.padding,
        barY,
        HUD_LAYOUT.barWidth,
        HUD_LAYOUT.barHeight,
        HUD_COLORS.barBackground,
      )
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, HUD_COLORS.panelBorder);
    this.fill = scene.add
      .rectangle(
        HUD_LAYOUT.padding,
        barY,
        HUD_LAYOUT.barWidth,
        HUD_LAYOUT.barHeight - 4,
        color,
      )
      .setOrigin(0, 0.5);

    container.add([labelText, this.valueText, background, this.fill]);
  }

  update(currentValue: number, maximumValue: number): void {
    const safeMaximum = Math.max(1, maximumValue);
    const ratio = Phaser.Math.Clamp(currentValue / safeMaximum, 0, 1);

    this.fill.setScale(ratio, 1);
    this.valueText.setText(
      `${formatHudNumber(currentValue)} / ${formatHudNumber(maximumValue)}`,
    );
  }
}

function formatHudNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
