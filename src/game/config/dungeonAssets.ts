export const DUNGEON_MAP = {
  key: 'dungeon-map-01',
  path: 'assets/dungeon/dungeon-01.tmj',
  scale: 3,
  ambientTint: 0x4b5263,
  lightingLayer: 'Fire',
  collisionLayer: 'Collision',
  visionBlockingLayer: 'VisionBlockers',
  playerSpawnLayer: 'PlayerSpawns',
  enemySpawnLayer: 'EnemySpawns',
  chestSpawnLayer: 'ChestSpawns',
  keySpawnLayer: 'KeySpawns',
  exitGateLayer: 'ExitGates',
} as const;

export const PLAYER_SPAWN_SAFETY = {
  minimumEnemyDistance: 11 * 16 * DUNGEON_MAP.scale,
} as const;

export const DUNGEON_TILESETS = [
  {
    name: 'cracked_tiles',
    key: 'dungeon-cracked-walls',
    file: 'decorative_cracks_walls.png',
  },
  {
    name: 'cracked_tiles_floor',
    key: 'dungeon-cracked-floor',
    file: 'decorative_cracks_floor.png',
  },
  { name: 'walls_floor', key: 'dungeon-walls-floor', file: 'walls_floor.png' },
  {
    name: 'Water_coasts_animation',
    key: 'dungeon-water-coasts',
    file: 'Water_coasts_animation.png',
  },
  {
    name: 'Water_detilazation',
    key: 'dungeon-water-details',
    file: 'water_details_animation.png',
  },
  {
    name: 'Water_coasts_animation_decorative_cracks',
    key: 'dungeon-water-cracks',
    file: 'decorative_cracks_coasts_animation.png',
  },
  { name: 'fire_animation', key: 'dungeon-fire', file: 'fire_animation.png' },
  { name: 'fire_animation2', key: 'dungeon-fire-alt', file: 'fire_animation2.png' },
  {
    name: 'doors_lever_chest_animation',
    key: 'dungeon-doors',
    file: 'doors_lever_chest_animation.png',
  },
  { name: 'Objects', key: 'dungeon-objects', file: 'Objects.png' },
  {
    name: 'trap_animation',
    key: 'dungeon-traps',
    file: 'trap_animation.png',
  },
  { name: 'Composicao', key: 'dungeon-composition', file: 'Composicao.png' },
] as const;

export const DUNGEON_RENDER_LAYERS = [
  { name: 'Floor', depth: 0 },
  { name: 'Water', depth: 1 },
  { name: 'Walls', depth: 2 },
  { name: 'Details', depth: 3 },
  { name: 'Props', depth: 6 },
  { name: 'Traps', depth: 7 },
  { name: 'Doors', depth: 12 },
  { name: 'Fire', depth: 30 },
] as const;
