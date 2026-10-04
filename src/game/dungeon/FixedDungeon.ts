import Phaser from 'phaser';

import { DUNGEON_STYLE, INTERIOR_WALLS } from '../config/dungeon';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../constants/game';
import type { WallDefinition } from '../types/dungeon';

export class FixedDungeon {
  readonly walls: Phaser.Physics.Arcade.StaticGroup;

  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.walls = scene.physics.add.staticGroup();
  }

  create(): void {
    this.createFloor();
    this.createBoundaryWalls();

    for (const wall of INTERIOR_WALLS) {
      this.createWall(wall);
    }
  }

  private createFloor(): void {
    this.scene.add.grid(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      DUNGEON_STYLE.tileSize,
      DUNGEON_STYLE.tileSize,
      DUNGEON_STYLE.floorColor,
      1,
      DUNGEON_STYLE.floorGridColor,
      0.55,
    );
  }

  private createBoundaryWalls(): void {
    const thickness = DUNGEON_STYLE.wallThickness;

    this.createWall({
      x: WORLD_WIDTH / 2,
      y: thickness / 2,
      width: WORLD_WIDTH,
      height: thickness,
    });
    this.createWall({
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT - thickness / 2,
      width: WORLD_WIDTH,
      height: thickness,
    });
    this.createWall({
      x: thickness / 2,
      y: WORLD_HEIGHT / 2,
      width: thickness,
      height: WORLD_HEIGHT - thickness * 2,
    });
    this.createWall({
      x: WORLD_WIDTH - thickness / 2,
      y: WORLD_HEIGHT / 2,
      width: thickness,
      height: WORLD_HEIGHT - thickness * 2,
    });
  }

  private createWall(definition: WallDefinition): void {
    const wall = this.scene.add
      .rectangle(
        definition.x,
        definition.y,
        definition.width,
        definition.height,
        DUNGEON_STYLE.wallColor,
      )
      .setStrokeStyle(2, DUNGEON_STYLE.wallBorderColor);

    this.scene.physics.add.existing(wall, true);
    this.walls.add(wall);
  }
}
