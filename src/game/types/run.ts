import type { PlayerClass } from './player';

export interface RunState {
  readonly id: string;
  readonly playerId: string;
  readonly playerName: string;
  readonly playerClass: PlayerClass;
  readonly startedAt: number;
  level: number;
  experience: number;
  kills: number;
  gold: number;
  elapsedSeconds: number;
}
