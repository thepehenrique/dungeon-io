import Phaser from 'phaser';

import { HUD_COLORS } from '../../config/hud';

export interface HudBarLayout {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fillInsetX: number;
  readonly fillHeight: number;
}

export class HudBar {
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly valueText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    layout: HudBarLayout,
    frameTexture: string,
    label: string,
    color: number,
  ) {
    const centerY = layout.y + layout.height / 2;
    const fillWidth = layout.width - layout.fillInsetX * 2;
    const background = scene.add
      .rectangle(
        layout.x + layout.fillInsetX,
        centerY,
        fillWidth,
        layout.fillHeight,
        HUD_COLORS.barBackground,
        0.96,
      )
      .setOrigin(0, 0.5);
    this.fill = scene.add
      .rectangle(
        layout.x + layout.fillInsetX,
        centerY,
        fillWidth,
        layout.fillHeight,
        color,
      )
      .setOrigin(0, 0.5);
    const frame = scene.add
      .image(layout.x, layout.y, frameTexture)
      .setOrigin(0)
      .setDisplaySize(layout.width, layout.height);
    const labelText = scene.add.text(layout.x + layout.fillInsetX + 6, centerY - 7, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: layout.fillHeight > 8 ? '11px' : '9px',
      fontStyle: 'bold',
      color: HUD_COLORS.primaryText,
      stroke: '#080a0d',
      strokeThickness: 2,
    });
    this.valueText = scene.add
      .text(layout.x + layout.width - layout.fillInsetX - 6, centerY - 7, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: layout.fillHeight > 8 ? '11px' : '9px',
        color: HUD_COLORS.primaryText,
        stroke: '#080a0d',
        strokeThickness: 2,
      })
      .setOrigin(1, 0);

    container.add([background, this.fill, frame, labelText, this.valueText]);
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
