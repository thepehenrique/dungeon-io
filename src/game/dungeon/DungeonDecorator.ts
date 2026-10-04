import Phaser from 'phaser';

import { DARK_ZONES, DUNGEON_DECORATIONS } from '../config/dungeon';
import { DungeonDecorationType } from '../types/dungeon';
import { DUNGEON_TEXTURE_KEYS } from './dungeonTextures';

const DECORATION_TEXTURES: Readonly<Record<DungeonDecorationType, string>> = {
  [DungeonDecorationType.Torch]: DUNGEON_TEXTURE_KEYS.torch,
  [DungeonDecorationType.Barrel]: DUNGEON_TEXTURE_KEYS.barrel,
  [DungeonDecorationType.Crate]: DUNGEON_TEXTURE_KEYS.crate,
  [DungeonDecorationType.Bones]: DUNGEON_TEXTURE_KEYS.bones,
  [DungeonDecorationType.Web]: DUNGEON_TEXTURE_KEYS.web,
};

export class DungeonDecorator {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly walls: Phaser.Physics.Arcade.StaticGroup,
  ) {}

  create(): void {
    this.createDarkZones();

    for (const decoration of DUNGEON_DECORATIONS) {
      const image = this.scene.add
        .image(decoration.x, decoration.y, DECORATION_TEXTURES[decoration.type])
        .setRotation(decoration.rotation ?? 0)
        .setDepth(7);

      if (decoration.type === DungeonDecorationType.Torch) {
        this.createTorchGlow(decoration.x, decoration.y - 7);
      }

      if (decoration.collidable) {
        this.scene.physics.add.existing(image, true);
        this.walls.add(image);
      }
    }
  }

  private createDarkZones(): void {
    for (const zone of DARK_ZONES) {
      this.scene.add
        .rectangle(zone.x, zone.y, zone.width, zone.height, 0x000000, zone.alpha)
        .setDepth(2);
    }
  }

  private createTorchGlow(x: number, y: number): void {
    const glow = this.scene.add.circle(x, y, 58, 0xff8a2b, 0.11).setDepth(3);

    this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.08, to: 0.16 },
      scale: { from: 0.92, to: 1.08 },
      duration: Phaser.Math.Between(750, 1100),
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    });
  }
}
