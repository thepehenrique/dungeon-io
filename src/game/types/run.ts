import type { InventoryState } from './inventory';
import type { PlayerClass } from './player';

export enum RunEndReason {
  Defeated = 'DEFEATED',
}

export interface RunState {
  readonly id: string;
  readonly playerId: string;
  readonly playerName: string;
  readonly playerClass: PlayerClass;
  readonly startedAt: number;
  endedAt: number | null;
  endReason: RunEndReason | null;
  level: number;
  experience: number;
  kills: number;
  gold: number;
  inventory: InventoryState;
  elapsedSeconds: number;
}
