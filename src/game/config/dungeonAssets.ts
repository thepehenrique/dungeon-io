export const DUNGEON_MAP = {
  key: 'dungeon-map-01',
  path: 'assets/dungeon/dungeon-01.tmj',
  scale: 3,
  collisionLayer: 'Collision',
  spawnLayer: 'SpawnPoints',
} as const;

export const DUNGEON_TILESETS = [
  { name: 'walls_floor', key: 'dungeon-walls-floor', file: 'walls_floor.png' },
] as const;

export const DUNGEON_RENDER_LAYERS = [
  'Floor',
  'Walls',
] as const;
