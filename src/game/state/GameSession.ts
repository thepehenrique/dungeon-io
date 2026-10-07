import { createInitialInventoryState } from '../config/inventory';
import { RUN_OBJECTIVE_CONFIG } from '../config/runObjective';
import type { PlayerClass } from '../types/player';
import { RunEndReason, RunPhase, type RunState } from '../types/run';

export class GameSession {
  private currentRun: RunState | null = null;

  startRun(playerName: string, playerClass: PlayerClass): RunState {
    this.currentRun = {
      id: crypto.randomUUID(),
      playerId: crypto.randomUUID(),
      playerName: playerName.trim(),
      playerClass,
      startedAt: Date.now(),
      endedAt: null,
      endReason: null,
      level: 1,
      experience: 0,
      kills: 0,
      gold: 0,
      inventory: createInitialInventoryState(),
      elapsedSeconds: 0,
      gameplayElapsedMs: 0,
      remainingTimeMs: RUN_OBJECTIVE_CONFIG.totalDurationMs,
      phase: RunPhase.Preparation,
      hasDungeonKey: false,
    };

    return this.currentRun;
  }

  finishRun(reason: RunEndReason): RunState | null {
    if (this.currentRun && this.currentRun.endedAt === null) {
      const endedAt = Date.now();
      this.currentRun.endedAt = endedAt;
      this.currentRun.endReason = reason;
      this.currentRun.elapsedSeconds = Math.floor(
        this.currentRun.gameplayElapsedMs / 1000,
      );
      this.currentRun.phase = reason === RunEndReason.Escaped
        ? RunPhase.Escaped
        : RunPhase.GameOver;
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
