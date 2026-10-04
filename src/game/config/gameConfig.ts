import Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../constants/game';
import { BootScene } from '../scenes/BootScene';
import { DungeonScene } from '../scenes/DungeonScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { MenuScene } from '../scenes/MenuScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#08090d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: [BootScene, MenuScene, DungeonScene, GameOverScene],
};
