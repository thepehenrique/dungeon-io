import Phaser from 'phaser';

import { RunPhase, type RunState } from '../types/run';
import { DungeonKey } from '../objectives/DungeonKey';
import { ExitDoor } from '../objectives/ExitDoor';

export interface ObjectiveSpawnPoint {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

export type ExitInteractionResult = 'LOCKED' | 'ESCAPED' | 'INACTIVE';

export interface RunObjectiveEvents {
  readonly onKeyCollected: () => void;
  readonly onEscaped: () => void;
}

export class RunObjectiveSystem {
  readonly exitDoor: ExitDoor;

  private dungeonKey: DungeonKey | null = null;
  private interactionLocked = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly run: RunState,
    private readonly playerSpawn: ObjectiveSpawnPoint,
    private readonly keySpawns: readonly ObjectiveSpawnPoint[],
    exitSpawns: readonly ObjectiveSpawnPoint[],
    private readonly events: RunObjectiveEvents,
  ) {
    if (keySpawns.length === 0) {
      throw new Error('The dungeon requires at least one KeySpawns point.');
    }

    if (exitSpawns.length === 0) {
      throw new Error('The dungeon requires at least one ExitGates spawn.');
    }

    const candidates = exitSpawns.filter((spawn) => !samePoint(spawn, playerSpawn));
    const selectedExit = randomItem(candidates.length > 0 ? candidates : exitSpawns);
    this.exitDoor = new ExitDoor(scene, selectedExit.x, selectedExit.y);
  }

  get key(): DungeonKey | null {
    return this.dungeonKey?.active ? this.dungeonKey : null;
  }

  get hasKey(): boolean {
    return this.run.hasDungeonKey;
  }

  beginEscapePhase(): void {
    if (this.dungeonKey || this.run.phase !== RunPhase.Escape) {
      return;
    }

    const candidates = this.keySpawns.filter(
      (spawn) =>
        !samePoint(spawn, this.playerSpawn) &&
        !sameCoordinates(spawn.x, spawn.y, this.exitDoor.x, this.exitDoor.y),
    );

    if (candidates.length === 0) {
      throw new Error('The dungeon requires a KeySpawns point distinct from the exit.');
    }

    const spawn = randomItem(candidates);
    this.dungeonKey = new DungeonKey(this.scene, spawn.x, spawn.y);
  }

  collectKey(): boolean {
    if (!this.dungeonKey || this.run.hasDungeonKey || this.interactionLocked) {
      return false;
    }

    this.run.hasDungeonKey = true;
    this.dungeonKey.destroy();
    this.dungeonKey = null;
    this.events.onKeyCollected();
    return true;
  }

  interactWithExit(): ExitInteractionResult {
    if (this.interactionLocked || this.run.phase === RunPhase.Escaped) {
      return 'INACTIVE';
    }

    if (!this.run.hasDungeonKey) {
      return 'LOCKED';
    }

    this.interactionLocked = true;
    this.events.onEscaped();
    return 'ESCAPED';
  }

  destroy(): void {
    this.interactionLocked = true;
    this.dungeonKey?.destroy();
    this.dungeonKey = null;
    this.exitDoor.destroy();
  }
}

function randomItem<T>(items: readonly T[]): T {
  const selected = items[Math.floor(Math.random() * items.length)];

  if (selected === undefined) {
    throw new Error('Cannot choose a random item from an empty list.');
  }

  return selected;
}

function samePoint(first: ObjectiveSpawnPoint, second: ObjectiveSpawnPoint): boolean {
  return sameCoordinates(first.x, first.y, second.x, second.y);
}

function sameCoordinates(x1: number, y1: number, x2: number, y2: number): boolean {
  return x1 === x2 && y1 === y2;
}
