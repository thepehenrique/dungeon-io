import { PLAYER_SPAWN_SAFETY } from '../config/dungeonAssets';
import { RUN_OBJECTIVE_CONFIG } from '../config/runObjective';
import type { EnemySpawnDefinition } from '../types/enemy';
import type { MapPoint } from './TilemapDungeon';

export interface SpawnGrid {
  readonly width: number;
  readonly height: number;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly isBlocked: (x: number, y: number) => boolean;
  readonly hasFloor: (x: number, y: number) => boolean;
  readonly isReserved: (x: number, y: number) => boolean;
}

export function findPlayerSpawnPoints(grid: SpawnGrid, start: MapPoint): MapPoint[] {
  const inBounds = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < grid.width && y < grid.height;
  const queue = [{
    x: Math.floor(start.x / grid.tileWidth),
    y: Math.floor(start.y / grid.tileHeight),
  }];
  const visited = new Set<number>();
  const candidates: MapPoint[] = [];

  for (let index = 0; index < queue.length; index += 1) {
    const { x, y } = queue[index];
    const key = y * grid.width + x;
    if (!inBounds(x, y) || visited.has(key) || grid.isBlocked(x, y)) {
      continue;
    }
    visited.add(key);
    queue.push({ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 });

    let clear = grid.hasFloor(x, y);
    // Clearance for every class's body and the feet below its sprite center.
    for (let dy = -1; dy <= 1 && clear; dy += 1) {
      for (let dx = -1; dx <= 1 && clear; dx += 1) {
        clear = inBounds(x + dx, y + dy) &&
          !grid.isBlocked(x + dx, y + dy) &&
          !grid.isReserved(x + dx, y + dy);
      }
    }
    if (clear) {
      candidates.push({
        id: `PlayerSpawn_${x}_${y}`,
        x: (x + 0.5) * grid.tileWidth,
        y: (y + 0.5) * grid.tileHeight,
        safeStart: true,
      });
    }
  }
  return candidates;
}

export function findExitSpawnPoints(grid: SpawnGrid, candidates: readonly MapPoint[]): MapPoint[] {
  const size = RUN_OBJECTIVE_CONFIG.exitDoorDisplaySize;
  const halfWidth = Math.ceil((size - grid.tileWidth) / (2 * grid.tileWidth));
  const height = Math.ceil(size / grid.tileHeight);
  return candidates.filter((point) => {
    const x = Math.floor(point.x / grid.tileWidth);
    const y = Math.floor(point.y / grid.tileHeight);
    // The portal is anchored at its bottom; leave an approach below it.
    for (let dy = -height; dy <= 1; dy += 1) {
      for (let dx = -halfWidth; dx <= halfWidth; dx += 1) {
        const tx = x + dx;
        const ty = y + dy;
        if (tx < 0 || ty < 0 || tx >= grid.width || ty >= grid.height ||
          !grid.hasFloor(tx, ty) || grid.isBlocked(tx, ty) || grid.isReserved(tx, ty)) {
          return false;
        }
      }
    }
    return true;
  }).map(({ id, x, y }) => ({ id: `Exit_${id}`, x, y }));
}

export function selectRunSpawns(
  candidates: readonly MapPoint[],
  enemies: readonly EnemySpawnDefinition[],
  random: () => number = Math.random,
  enemyCandidates: readonly MapPoint[] = candidates,
): { playerSpawn: MapPoint; enemySpawns: EnemySpawnDefinition[] } {
  const playerSpawn = candidates[Math.floor(random() * candidates.length)];
  if (!playerSpawn) {
    throw new Error('The dungeon requires a reachable player spawn.');
  }
  const distanceSquared = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  const isSafe = (point: { x: number; y: number }) =>
    distanceSquared(point, playerSpawn) > PLAYER_SPAWN_SAFETY.minimumEnemyDistance ** 2;
  const occupied = enemies.filter(isSafe).map(({ x, y }) => ({ x, y }));
  const safeCandidates = enemyCandidates.filter(isSafe);
  const enemySpawns = enemies.map((enemy) => {
    if (isSafe(enemy)) {
      return enemy;
    }
    const available = safeCandidates.filter((point) =>
      (!enemy.region || point.region === enemy.region) &&
      occupied.every((other) => distanceSquared(point, other) >= 48 ** 2),
    );
    const point = available[Math.floor(random() * available.length)];
    if (!point) {
      throw new Error('The dungeon requires enough enemy spawns outside the player safety radius.');
    }
    occupied.push(point);
    return { ...enemy, x: point.x, y: point.y };
  });
  return { playerSpawn, enemySpawns };
}
