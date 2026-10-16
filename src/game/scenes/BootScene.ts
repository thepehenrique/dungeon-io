import Phaser from 'phaser';

import {
  ARCHER_DASH_SOUND,
  ARROW_SHOT_SOUND,
  DUNGEON_MUSIC,
  FIREBALL_CAST_SOUND,
  MENU_MUSIC,
  SWORD_ATTACK_SOUND,
  WARRIOR_BLOCK_SOUND,
} from '../config/audio';
import { DUNGEON_MAP, DUNGEON_TILESETS } from '../config/dungeonAssets';
import { PHASER_UI_ASSETS } from '../config/uiAssets';
import { REGISTRY_KEYS, SCENE_KEYS } from '../constants/game';
import { createDungeonPlaceholderTextures } from '../dungeon/dungeonTextures';
import { createEnemyPlaceholderTextures } from '../enemies/enemyTextures';
import {
  createGoblinAnimations,
  preloadGoblinSprites,
} from '../enemies/goblinAnimations';
import {
  createSkeletonAnimations,
  preloadSkeletonSprites,
} from '../enemies/skeletonAnimations';
import {
  createZombieAnimations,
  preloadZombieSprites,
} from '../enemies/zombieAnimations';
import {
  createChestAnimations,
  preloadChestSprites,
} from '../items/chests/chestAnimations';
import { preloadConsumableTextures } from '../items/consumables/consumableTextures';
import { createWorldItemPlaceholderTextures } from '../items/world/worldItemTextures';
import {
  createArcherAnimations,
  preloadArcherSprites,
} from '../player/archerAnimations';
import { preloadClassAbilityTextures } from '../player/classAbilityTextures';
import { createPlayerPlaceholderTextures } from '../player/playerTextures';
import {
  createMageAnimations,
  preloadMageSprites,
} from '../player/mageAnimations';
import {
  createWarriorAnimations,
  preloadWarriorSprites,
} from '../player/warriorAnimations';
import {
  createProjectileTextures,
  preloadProjectileTextures,
} from '../projectiles/projectileTextures';
import {
  createObjectiveTextures,
  preloadObjectiveTextures,
} from '../objectives/objectiveTextures';
import { GameSession } from '../state/GameSession';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  preload(): void {
    this.load.tilemapTiledJSON(DUNGEON_MAP.key, DUNGEON_MAP.path);
    this.load.audio(MENU_MUSIC.key, MENU_MUSIC.path);
    this.load.audio(DUNGEON_MUSIC.key, DUNGEON_MUSIC.path);
    this.load.audio(ARROW_SHOT_SOUND.key, ARROW_SHOT_SOUND.path);
    this.load.audio(ARCHER_DASH_SOUND.key, ARCHER_DASH_SOUND.path);
    this.load.audio(FIREBALL_CAST_SOUND.key, FIREBALL_CAST_SOUND.path);
    this.load.audio(WARRIOR_BLOCK_SOUND.key, WARRIOR_BLOCK_SOUND.path);
    this.load.audio(SWORD_ATTACK_SOUND.key, SWORD_ATTACK_SOUND.path);
    preloadArcherSprites(this);
    preloadWarriorSprites(this);
    preloadMageSprites(this);
    preloadGoblinSprites(this);
    preloadSkeletonSprites(this);
    preloadZombieSprites(this);
    preloadChestSprites(this);
    preloadConsumableTextures(this);
    preloadClassAbilityTextures(this);
    preloadObjectiveTextures(this);
    preloadProjectileTextures(this);

    for (const asset of PHASER_UI_ASSETS) {
      this.load.image(asset.key, asset.path);
    }

    for (const tileset of DUNGEON_TILESETS) {
      this.load.image(tileset.key, `assets/dungeon/${tileset.file}`);
    }
  }

  create(): void {
    createChestAnimations(this);
    createWorldItemPlaceholderTextures(this);
    createDungeonPlaceholderTextures(this);
    createEnemyPlaceholderTextures(this);
    createPlayerPlaceholderTextures(this);
    createGoblinAnimations(this);
    createSkeletonAnimations(this);
    createZombieAnimations(this);
    createArcherAnimations(this);
    createMageAnimations(this);
    createWarriorAnimations(this);
    createProjectileTextures(this);
    createObjectiveTextures(this);
    this.registry.set(REGISTRY_KEYS.GAME_SESSION, new GameSession());
    this.scene.start(SCENE_KEYS.MENU);
  }
}
