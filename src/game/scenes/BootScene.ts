import Phaser from 'phaser';

import { DUNGEON_MAP, DUNGEON_TILESETS } from '../config/dungeonAssets';
import { REGISTRY_KEYS, SCENE_KEYS } from '../constants/game';
import { createDungeonPlaceholderTextures } from '../dungeon/dungeonTextures';
import { createEnemyPlaceholderTextures } from '../enemies/enemyTextures';
import { createChestPlaceholderTextures } from '../items/chests/chestTextures';
import { createPlayerPlaceholderTextures } from '../player/playerTextures';
import { createProjectilePlaceholderTextures } from '../projectiles/projectileTextures';
import { GameSession } from '../state/GameSession';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  preload(): void {
    this.load.tilemapTiledJSON(DUNGEON_MAP.key, DUNGEON_MAP.path);

    for (const tileset of DUNGEON_TILESETS) {
      this.load.image(tileset.key, `assets/dungeon/${tileset.file}`);
    }
  }

  create(): void {
    createChestPlaceholderTextures(this);
    createDungeonPlaceholderTextures(this);
    createEnemyPlaceholderTextures(this);
    createPlayerPlaceholderTextures(this);
    createProjectilePlaceholderTextures(this);
    this.registry.set(REGISTRY_KEYS.GAME_SESSION, new GameSession());
    this.scene.start(SCENE_KEYS.MENU);
  }
}
