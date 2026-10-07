import { RUN_OBJECTIVE_CONFIG } from '../config/runObjective';
import { RunPhase, type RunState } from '../types/run';

export interface RunTimerEvents {
  readonly onEscapeStarted: () => void;
  readonly onTimeExpired: () => void;
}

export class RunTimerSystem {
  private finished = false;

  constructor(
    private readonly run: RunState,
    private readonly events: RunTimerEvents,
  ) {}

  update(deltaMs: number): void {
    if (this.finished || this.isTerminalPhase()) {
      return;
    }

    this.run.gameplayElapsedMs = Math.min(
      RUN_OBJECTIVE_CONFIG.totalDurationMs,
      this.run.gameplayElapsedMs + Math.max(0, deltaMs),
    );
    this.run.elapsedSeconds = Math.floor(this.run.gameplayElapsedMs / 1000);
    this.run.remainingTimeMs = Math.max(
      0,
      RUN_OBJECTIVE_CONFIG.totalDurationMs - this.run.gameplayElapsedMs,
    );

    if (
      this.run.phase === RunPhase.Preparation &&
      this.run.gameplayElapsedMs >= RUN_OBJECTIVE_CONFIG.preparationDurationMs
    ) {
      this.run.phase = RunPhase.Escape;
      this.events.onEscapeStarted();
    }

    if (this.run.remainingTimeMs === 0 && !this.isTerminalPhase()) {
      this.finished = true;
      this.events.onTimeExpired();
    }
  }

  stop(): void {
    this.finished = true;
  }

  private isTerminalPhase(): boolean {
    return this.run.phase === RunPhase.Escaped || this.run.phase === RunPhase.GameOver;
  }
}
