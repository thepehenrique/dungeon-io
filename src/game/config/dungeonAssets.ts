export const DUNGEON_MAP = {
  key: 'dungeon-map-01',
  path: 'assets/dungeon/dungeon-01.tmj',
  scale: 3,
  collisionLayer: 'Collision',
  spawnLayer: 'SpawnPoints',
} as const;

export const DUNGEON_TILESETS = [
  { name: 'walls_floor', key: 'dungeon-walls-floor', file: 'walls_floor.png' },
  { name: 'Objects', key: 'dungeon-objects', file: 'Objects.png' },
  {
    name: 'decorative_cracks_floor',
    key: 'dungeon-floor-cracks',
    file: 'decorative_cracks_floor.png',
  },
  { name: 'fire_animation', key: 'dungeon-fire', file: 'fire_animation.png' },
] as const;

export const DUNGEON_RENDER_LAYERS = [
  'Floor',
  'FloorDetails',
  'Walls',
  'WallDetails',
  'Obstacles',
  'Decoration',
] as const;
