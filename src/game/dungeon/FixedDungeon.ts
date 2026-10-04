import Phaser from 'phaser';

import {
  DUNGEON_ROOMS,
  DUNGEON_STYLE,
  INTERIOR_WALLS,
  ROOM_FLOOR_COLORS,
} from '../config/dungeon';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../constants/game';
import type { WallDefinition } from '../types/dungeon';
import { DungeonDecorator } from './DungeonDecorator';

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

    new DungeonDecorator(this.scene, this.walls).create();
  }

  private createFloor(): void {
    this.scene.add
      .rectangle(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT / 2,
        WORLD_WIDTH,
        WORLD_HEIGHT,
        DUNGEON_STYLE.floorColor,
      )
      .setDepth(0);

    for (const room of DUNGEON_ROOMS) {
      this.scene.add
        .rectangle(
          room.x,
          room.y,
          room.width,
          room.height,
          ROOM_FLOOR_COLORS[room.type],
        )
        .setStrokeStyle(2, DUNGEON_STYLE.roomBorderColor, 0.75)
        .setDepth(0);
    }

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
      0.45,
    ).setDepth(1);
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
      .setStrokeStyle(2, DUNGEON_STYLE.wallBorderColor)
      .setDepth(8);

    this.scene.physics.add.existing(wall, true);
    this.walls.add(wall);
    this.createWallPattern(definition);
  }

  private createWallPattern(definition: WallDefinition): void {
    const graphics = this.scene.add.graphics().setDepth(8);
    const left = definition.x - definition.width / 2;
    const top = definition.y - definition.height / 2;
    const blockSize = DUNGEON_STYLE.stoneBlockSize;

    graphics.lineStyle(1, DUNGEON_STYLE.wallMortarColor, 0.9);

    if (definition.width >= definition.height) {
      graphics.lineBetween(left, definition.y, left + definition.width, definition.y);

      for (let x = left + blockSize; x < left + definition.width; x += blockSize) {
        graphics.lineBetween(x, top, x, top + definition.height / 2);
      }

      for (let x = left + blockSize / 2; x < left + definition.width; x += blockSize) {
        graphics.lineBetween(x, definition.y, x, top + definition.height);
      }
      return;
    }

    graphics.lineBetween(definition.x, top, definition.x, top + definition.height);

    for (let y = top + blockSize; y < top + definition.height; y += blockSize) {
      graphics.lineBetween(left, y, definition.x, y);
    }

    for (let y = top + blockSize / 2; y < top + definition.height; y += blockSize) {
      graphics.lineBetween(definition.x, y, left + definition.width, y);
    }
  }
}
