import type { WallDefinition } from '../types/dungeon';

export const DUNGEON_STYLE = {
  floorColor: 0x0d1118,
  floorGridColor: 0x1c2733,
  wallColor: 0x283341,
  wallBorderColor: 0x526173,
  tileSize: 64,
  wallThickness: 64,
} as const;

export const DUNGEON_SPAWN = {
  x: 400,
  y: 400,
} as const;

export const INTERIOR_WALLS: readonly WallDefinition[] = [
  { x: 800, y: 330, width: 64, height: 532 },
  { x: 800, y: 1290, width: 64, height: 556 },
  { x: 1600, y: 330, width: 64, height: 532 },
  { x: 1600, y: 1290, width: 64, height: 556 },
  { x: 300, y: 800, width: 472, height: 64 },
  { x: 1200, y: 800, width: 400, height: 64 },
  { x: 2100, y: 800, width: 472, height: 64 },
] as const;
