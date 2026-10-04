export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1600;

export const SCENE_KEYS = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  DUNGEON: 'DungeonScene',
  GAME_OVER: 'GameOverScene',
} as const;

export const REGISTRY_KEYS = {
  GAME_SESSION: 'gameSession',
} as const;
