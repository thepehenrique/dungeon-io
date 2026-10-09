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
  volume: 0.2,
};
