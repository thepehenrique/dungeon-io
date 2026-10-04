import type { PlayerClass } from '../types/player';
import type { RunState } from '../types/run';

export class GameSession {
  private currentRun: RunState | null = null;

  startRun(playerName: string, playerClass: PlayerClass): RunState {
    this.currentRun = {
      id: crypto.randomUUID(),
      playerId: crypto.randomUUID(),
      playerName: playerName.trim(),
      playerClass,
      startedAt: Date.now(),
      level: 1,
      experience: 0,
      kills: 0,
      gold: 0,
      elapsedSeconds: 0,
    };

    return this.currentRun;
  }

  finishRun(): RunState | null {
    if (this.currentRun) {
      this.currentRun.elapsedSeconds = Math.floor(
        (Date.now() - this.currentRun.startedAt) / 1000,
      );
    }

    return this.currentRun;
  }

  getRun(): RunState | null {
    return this.currentRun;
  }

  restartRun(): RunState | null {
    const previousRun = this.currentRun;

    if (!previousRun) {
      return null;
    }

    return this.startRun(previousRun.playerName, previousRun.playerClass);
  }

  clear(): void {
    this.currentRun = null;
  }
}
