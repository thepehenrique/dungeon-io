import Phaser from 'phaser';

import {
  DUNGEON_MAP,
  DUNGEON_RENDER_LAYERS,
  DUNGEON_TILESETS,
} from '../config/dungeonAssets';
import type { ChestSpawnDefinition } from '../types/chest';
import { EnemyType, type EnemySpawnDefinition } from '../types/enemy';
import { ItemRarity } from '../types/item';

interface TiledProperty {
  readonly name: string;
  readonly value: unknown;
}

export interface MapPoint {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

export class TilemapDungeon {
  readonly walls: Phaser.Physics.Arcade.StaticGroup;

  private map: Phaser.Tilemaps.Tilemap | null = null;
  private playerSpawns: MapPoint[] = [];
  private enemySpawns: EnemySpawnDefinition[] = [];
  private chestSpawns: ChestSpawnDefinition[] = [];
  private keySpawns: MapPoint[] = [];
  private exitSpawns: MapPoint[] = [];

  constructor(private readonly scene: Phaser.Scene) {
    this.walls = scene.physics.add.staticGroup();
  }

  create(): void {
    const map = this.scene.make.tilemap({ key: DUNGEON_MAP.key });
    const tilesets = DUNGEON_TILESETS.map((definition) => {
      const tileset = map.addTilesetImage(definition.name, definition.key);

      if (!tileset) {
        throw new Error(`Tileset ${definition.name} could not be loaded.`);
      }

      return tileset;
    });

    for (const [depth, layerName] of DUNGEON_RENDER_LAYERS.entries()) {
      const layer = map.createLayer(layerName, tilesets, 0, 0);

      if (!layer) {
        throw new Error(`Dungeon layer ${layerName} is missing.`);
      }

      layer.setScale(DUNGEON_MAP.scale).setDepth(depth);

      if (layerName === DUNGEON_MAP.lightingLayer) {
        layer.setBlendMode(Phaser.BlendModes.ADD);
      } else {
        layer.setTint(DUNGEON_MAP.ambientTint);
      }
    }

    const collisionLayer = map.createLayer(DUNGEON_MAP.collisionLayer, tilesets, 0, 0);

    if (!collisionLayer) {
      throw new Error('Dungeon collision layer is missing.');
    }

    collisionLayer.setScale(DUNGEON_MAP.scale).setVisible(false);
    this.createCollisionBodies(collisionLayer);
    this.readSpawnPoints(map);
    this.map = map;
  }

  get width(): number {
    return this.requireMap().widthInPixels * DUNGEON_MAP.scale;
  }

  get height(): number {
    return this.requireMap().heightInPixels * DUNGEON_MAP.scale;
  }

  getPlayerSpawns(): readonly MapPoint[] {
    return this.playerSpawns;
  }

  getEnemySpawns(): readonly EnemySpawnDefinition[] {
    return this.enemySpawns;
  }

  getChestSpawns(): readonly ChestSpawnDefinition[] {
    return this.chestSpawns;
  }

  getKeySpawns(): readonly MapPoint[] {
    return this.keySpawns;
  }

  getExitSpawns(): readonly MapPoint[] {
    return this.exitSpawns;
  }

  private createCollisionBodies(layer: Phaser.Tilemaps.TilemapLayer): void {
    const worldTileSize = layer.layer.tileWidth * DUNGEON_MAP.scale;

    for (let y = 0; y < layer.layer.height; y += 1) {
      const row = layer.layer.data[y];
      let runStart = -1;

      for (let x = 0; x <= layer.layer.width; x += 1) {
        const isBlocked = x < layer.layer.width && (row[x]?.index ?? -1) !== -1;

        if (isBlocked && runStart === -1) {
          runStart = x;
          continue;
        }

        if (isBlocked || runStart === -1) {
          continue;
        }

        const runLength = x - runStart;
        const body = this.scene.add
          .rectangle(
            (runStart + runLength / 2) * worldTileSize,
            (y + 0.5) * worldTileSize,
            runLength * worldTileSize,
            worldTileSize,
            0x000000,
            0,
          )
          .setVisible(false);

        this.scene.physics.add.existing(body, true);
        this.walls.add(body);
        runStart = -1;
      }
    }
  }

  private readSpawnPoints(map: Phaser.Tilemaps.Tilemap): void {
    const playerLayer = map.getObjectLayer(DUNGEON_MAP.playerSpawnLayer);
    const enemyLayer = map.getObjectLayer(DUNGEON_MAP.enemySpawnLayer);
    const chestLayer = map.getObjectLayer(DUNGEON_MAP.chestSpawnLayer);
    const keyLayer = map.getObjectLayer(DUNGEON_MAP.keySpawnLayer);
    const exitGateLayer = map.getObjectLayer(DUNGEON_MAP.exitGateLayer);

    if (
      !playerLayer ||
      !enemyLayer ||
      !chestLayer ||
      !keyLayer ||
      !exitGateLayer
    ) {
      throw new Error('One or more dungeon spawn layers are missing.');
    }

    if (playerLayer.objects.length === 0) {
      throw new Error('Dungeon player spawn layer is empty.');
    }

    this.playerSpawns = playerLayer.objects.map((object, index) => ({
      id: object.name || `PlayerSpawn_${index + 1}`,
      x: (object.x ?? 0) * DUNGEON_MAP.scale,
      y: (object.y ?? 0) * DUNGEON_MAP.scale,
    }));
    this.enemySpawns = [];
    this.chestSpawns = [];
    this.keySpawns = keyLayer.objects.map((object, index) => ({
      id: object.name || `KeySpawn_${index + 1}`,
      x: (object.x ?? 0) * DUNGEON_MAP.scale,
      y: (object.y ?? 0) * DUNGEON_MAP.scale,
    }));
    this.exitSpawns = exitGateLayer.objects.map((object, index) => ({
      id: object.name || `ExitSpawn_${index + 1}`,
      x: (object.x ?? 0) * DUNGEON_MAP.scale,
      y: (object.y ?? 0) * DUNGEON_MAP.scale,
    }));

    for (const object of enemyLayer.objects) {
      const x = (object.x ?? 0) * DUNGEON_MAP.scale;
      const y = (object.y ?? 0) * DUNGEON_MAP.scale;
      const properties = (object.properties ?? []) as TiledProperty[];
      const enemyType = this.getProperty(properties, 'enemyType');
      const level = this.getProperty(properties, 'level');

      if (typeof enemyType === 'string' && this.isEnemyType(enemyType)) {
        this.enemySpawns.push({
          type: enemyType,
          x,
          y,
          level: typeof level === 'number' ? level : 1,
        });
      }
    }

    for (const object of chestLayer.objects) {
      const x = (object.x ?? 0) * DUNGEON_MAP.scale;
      const y = (object.y ?? 0) * DUNGEON_MAP.scale;
      const properties = (object.properties ?? []) as TiledProperty[];
      const rarity = this.getProperty(properties, 'rarity');

      if (typeof rarity === 'string' && this.isRarity(rarity)) {
        this.chestSpawns.push({ rarity, x, y });
      }
    }
  }

  private getProperty(properties: readonly TiledProperty[], name: string): unknown {
    return properties.find((property) => property.name === name)?.value;
  }

  private isEnemyType(value: string): value is EnemyType {
    return Object.values(EnemyType).includes(value as EnemyType);
  }

  private isRarity(value: string): value is ItemRarity {
    return Object.values(ItemRarity).includes(value as ItemRarity);
  }

  private requireMap(): Phaser.Tilemaps.Tilemap {
    if (!this.map) {
      throw new Error('Dungeon map has not been created yet.');
    }

    return this.map;
  }
}
