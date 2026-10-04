import type Phaser from 'phaser';

import { REGISTRY_KEYS } from '../constants/game';
import { GameSession } from './GameSession';

export function getGameSession(scene: Phaser.Scene): GameSession {
  const session = scene.registry.get(REGISTRY_KEYS.GAME_SESSION) as unknown;

  if (!(session instanceof GameSession)) {
    throw new Error('GameSession was not initialized by BootScene.');
  }

  return session;
}
