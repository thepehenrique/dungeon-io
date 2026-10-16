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

export const SKELETON_MOVEMENT_SOUND = {
  key: 'skeleton-movement',
  path: 'assets/audio/skeleton-movement.mp3',
  volume: 0.1,
  audibleRange: 480,
} as const;

export const GOBLIN_ALERT_SOUNDS = [
  {
    key: 'goblin-alert-1',
    path: 'assets/audio/goblin-alert-1.mp3',
    volume: 0.1,
    audibleRange: 480,
    loop: false,
  },
  {
    key: 'goblin-alert-2',
    path: 'assets/audio/goblin-alert-2.mp3',
    volume: 0.1,
    audibleRange: 480,
    loop: false,
  },
] as const;

export const GOBLIN_ATTACK_SOUND = {
  key: 'goblin-attack',
  path: 'assets/audio/goblin-attack.mp3',
  volume: 0.1,
} as const;

export const GOBLIN_LAUGH_SOUND = {
  key: 'goblin-laugh',
  path: 'assets/audio/goblin-laugh.mp3',
  volume: 0.1,
} as const;

export const ZOMBIE_MOVEMENT_SOUNDS = [
  { key: 'zombie-movement-1', path: 'assets/audio/zombie-movement-1.mp3' },
  { key: 'zombie-movement-2', path: 'assets/audio/zombie-movement-2.mp3' },
  { key: 'zombie-movement-3', path: 'assets/audio/zombie-movement-3.mp3' },
] as const;

export const ZOMBIE_MOVEMENT_SOUND_CONFIG = {
  key: ZOMBIE_MOVEMENT_SOUNDS[0].key,
  variants: ZOMBIE_MOVEMENT_SOUNDS.map((sound) => sound.key),
  volume: 0.1,
  audibleRange: 480,
} as const;
