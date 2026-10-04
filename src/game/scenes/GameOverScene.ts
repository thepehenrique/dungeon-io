import Phaser from 'phaser';

import { PLAYER_CLASSES } from '../config/playerClasses';
import { SCENE_KEYS } from '../constants/game';
import { getGameSession } from '../state/getGameSession';
import { RunEndReason } from '../types/run';
import { GameOverPanel } from '../ui/game-over/GameOverPanel';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.GAME_OVER);
  }

  create(): void {
    const session = getGameSession(this);
    const run = session.getRun();

    if (!run) {
      this.scene.start(SCENE_KEYS.MENU);
      return;
    }

    if (run.endReason === null) {
      session.finishRun(RunEndReason.Defeated);
    }

    new GameOverPanel(
      this,
      run,
      PLAYER_CLASSES[run.playerClass],
      {
        restart: () => {
          const restartedRun = session.restartRun();
          this.scene.start(restartedRun ? SCENE_KEYS.DUNGEON : SCENE_KEYS.MENU);
        },
        returnToMenu: () => {
          session.clear();
          this.scene.start(SCENE_KEYS.MENU);
        },
      },
    );
  }
}
