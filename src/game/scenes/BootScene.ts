import Phaser from 'phaser';

import { REGISTRY_KEYS, SCENE_KEYS } from '../constants/game';
import { createPlayerPlaceholderTextures } from '../player/playerTextures';
import { GameSession } from '../state/GameSession';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  create(): void {
    createPlayerPlaceholderTextures(this);
    this.registry.set(REGISTRY_KEYS.GAME_SESSION, new GameSession());
    this.scene.start(SCENE_KEYS.MENU);
  }
}
