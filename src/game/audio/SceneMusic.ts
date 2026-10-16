import Phaser from 'phaser';

import type { MusicTrackConfig } from '../config/audio';

let selectedMusicVolume: number | null = null;

export class SceneMusic {
  private sound: Phaser.Sound.BaseSound | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly track: MusicTrackConfig,
  ) {}

  get volume(): number {
    return selectedMusicVolume ?? this.track.volume;
  }

  setVolume(volume: number): void {
    selectedMusicVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.sound instanceof Phaser.Sound.WebAudioSound ||
      this.sound instanceof Phaser.Sound.HTML5AudioSound) {
      this.sound.setVolume(this.volume);
    }
  }

  start(): void {
    this.stop();
    this.sound = this.scene.sound.add(this.track.key, {
      loop: true,
      volume: this.volume,
    });

    if (this.scene.sound.locked) {
      this.scene.sound.once(
        Phaser.Sound.Events.UNLOCKED,
        this.play,
        this,
      );
      return;
    }

    this.play();
  }

  stop(): void {
    this.scene.sound.off(
      Phaser.Sound.Events.UNLOCKED,
      this.play,
      this,
    );
    this.sound?.stop();
    this.sound?.destroy();
    this.sound = null;
  }

  private play(): void {
    if (this.sound && !this.sound.isPlaying) {
      this.sound.play();
    }
  }
}
