import {
  DungeonDecorationType,
  DungeonRoomType,
  type DarkZoneDefinition,
  type DungeonDecorationDefinition,
  type DungeonRoomDefinition,
  type WallDefinition,
} from '../types/dungeon';

export const DUNGEON_STYLE = {
  floorColor: 0x0d1118,
  floorGridColor: 0x1c2733,
  wallColor: 0x283341,
  wallBorderColor: 0x526173,
  wallMortarColor: 0x151c25,
  roomBorderColor: 0x263442,
  tileSize: 64,
  wallThickness: 64,
  stoneBlockSize: 48,
  cameraFadeDurationMs: 350,
} as const;

export const ROOM_FLOOR_COLORS: Readonly<Record<DungeonRoomType, number>> = {
  [DungeonRoomType.Combat]: 0x111821,
  [DungeonRoomType.Treasure]: 0x1b1914,
};

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

export const DUNGEON_ROOMS: readonly DungeonRoomDefinition[] = [
  { id: 'start', type: DungeonRoomType.Combat, x: 416, y: 416, width: 704, height: 704 },
  { id: 'treasure', type: DungeonRoomType.Treasure, x: 1200, y: 416, width: 736, height: 704 },
  { id: 'north-east', type: DungeonRoomType.Combat, x: 1984, y: 416, width: 704, height: 704 },
  { id: 'south-west', type: DungeonRoomType.Combat, x: 416, y: 1184, width: 704, height: 704 },
  { id: 'south-center', type: DungeonRoomType.Combat, x: 1200, y: 1184, width: 736, height: 704 },
  { id: 'south-east', type: DungeonRoomType.Combat, x: 1984, y: 1184, width: 704, height: 704 },
] as const;

export const DUNGEON_DECORATIONS: readonly DungeonDecorationDefinition[] = [
  { type: DungeonDecorationType.Torch, x: 150, y: 125 },
  { type: DungeonDecorationType.Torch, x: 680, y: 125 },
  { type: DungeonDecorationType.Torch, x: 920, y: 125 },
  { type: DungeonDecorationType.Torch, x: 1480, y: 125 },
  { type: DungeonDecorationType.Torch, x: 1720, y: 125 },
  { type: DungeonDecorationType.Torch, x: 2250, y: 125 },
  { type: DungeonDecorationType.Torch, x: 150, y: 1475 },
  { type: DungeonDecorationType.Torch, x: 680, y: 1475 },
  { type: DungeonDecorationType.Torch, x: 920, y: 1475 },
  { type: DungeonDecorationType.Torch, x: 1480, y: 1475 },
  { type: DungeonDecorationType.Torch, x: 1720, y: 1475 },
  { type: DungeonDecorationType.Torch, x: 2250, y: 1475 },
  { type: DungeonDecorationType.Barrel, x: 215, y: 585, collidable: true },
  { type: DungeonDecorationType.Crate, x: 585, y: 585, rotation: 0.08, collidable: true },
  { type: DungeonDecorationType.Bones, x: 530, y: 265, rotation: -0.35 },
  { type: DungeonDecorationType.Web, x: 105, y: 105 },
  { type: DungeonDecorationType.Crate, x: 980, y: 590, rotation: -0.06, collidable: true },
  { type: DungeonDecorationType.Barrel, x: 1425, y: 585, collidable: true },
  { type: DungeonDecorationType.Bones, x: 1350, y: 280, rotation: 0.3 },
  { type: DungeonDecorationType.Web, x: 1540, y: 105, rotation: 0.5 },
  { type: DungeonDecorationType.Barrel, x: 1780, y: 590, collidable: true },
  { type: DungeonDecorationType.Crate, x: 2210, y: 570, rotation: 0.12, collidable: true },
  { type: DungeonDecorationType.Bones, x: 2050, y: 315, rotation: -0.2 },
  { type: DungeonDecorationType.Web, x: 2290, y: 105, rotation: -0.4 },
  { type: DungeonDecorationType.Crate, x: 210, y: 1020, rotation: -0.08, collidable: true },
  { type: DungeonDecorationType.Barrel, x: 650, y: 1320, collidable: true },
  { type: DungeonDecorationType.Bones, x: 390, y: 1220, rotation: 0.5 },
  { type: DungeonDecorationType.Web, x: 105, y: 1490 },
  { type: DungeonDecorationType.Barrel, x: 980, y: 1015, collidable: true },
  { type: DungeonDecorationType.Crate, x: 1410, y: 1320, rotation: 0.08, collidable: true },
  { type: DungeonDecorationType.Bones, x: 1180, y: 1190, rotation: -0.4 },
  { type: DungeonDecorationType.Crate, x: 1780, y: 1040, rotation: -0.1, collidable: true },
  { type: DungeonDecorationType.Barrel, x: 2210, y: 1320, collidable: true },
  { type: DungeonDecorationType.Bones, x: 2010, y: 1200, rotation: 0.25 },
  { type: DungeonDecorationType.Web, x: 2290, y: 1490, rotation: 0.3 },
] as const;

export const DARK_ZONES: readonly DarkZoneDefinition[] = [
  { x: 420, y: 1180, width: 540, height: 500, alpha: 0.16 },
  { x: 1200, y: 1180, width: 560, height: 500, alpha: 0.2 },
  { x: 1980, y: 1180, width: 540, height: 500, alpha: 0.18 },
] as const;
