export interface MusicTrackConfig {
  readonly key: string;
  readonly path: string;
  readonly volume: number;
}

export const MENU_MUSIC: MusicTrackConfig = {
  key: 'menu-theme',
  path: 'assets/audio/menu-theme.mp3',
  volume: 0.35,
};

export const DUNGEON_MUSIC: MusicTrackConfig = {
  key: 'dungeon-ambient',
  path: 'assets/audio/dungeon-ambient.mp3',
  volume: 0.08,
};

export const ARROW_SHOT_SOUND = {
  key: 'arrow-shot',
  path: 'assets/audio/arrow-shot.mp3',
  volume: 0.1,
  rate: 1.5,
} as const;

export const ARCHER_DASH_SOUND = {
  key: 'archer-dash',
  path: 'assets/audio/archer-dash.mp3',
  volume: 0.02,
} as const;

export const FIREBALL_CAST_SOUND = {
  key: 'fireball-cast',
  path: 'assets/audio/fireball-cast.mp3',
  volume: 0.1,
} as const;

export const WARRIOR_BLOCK_SOUND = {
  key: 'warrior-block',
  path: 'assets/audio/warrior-block.mp3',
  volume: 0.07,
} as const;

export const SWORD_ATTACK_SOUND = {
  key: 'sword-attack',
  path: 'assets/audio/sword-attack.mp3',
  volume: 0.1,
} as const;
