import Phaser from 'phaser';

import { REGISTRY_KEYS, SCENE_KEYS } from '../constants/game';
import { createEnemyPlaceholderTextures } from '../enemies/enemyTextures';
import { createPlayerPlaceholderTextures } from '../player/playerTextures';
import { createProjectilePlaceholderTextures } from '../projectiles/projectileTextures';
import { GameSession } from '../state/GameSession';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  create(): void {
    createEnemyPlaceholderTextures(this);
    createPlayerPlaceholderTextures(this);
    createProjectilePlaceholderTextures(this);
    this.registry.set(REGISTRY_KEYS.GAME_SESSION, new GameSession());
    this.scene.start(SCENE_KEYS.MENU);
  }
}
