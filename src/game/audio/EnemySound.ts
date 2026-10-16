import Phaser from 'phaser';

interface EnemySoundConfig {
  readonly key: string;
  readonly volume: number;
  readonly audibleRange: number;
  readonly loop?: boolean;
  readonly variants?: readonly string[];
}

export class EnemySound {
  private sound: Phaser.Sound.BaseSound | null;
  private hasPlayed = false;

  constructor(
    private readonly owner: Phaser.Physics.Arcade.Sprite,
    private readonly config: EnemySoundConfig,
  ) {
    const scene = owner.scene;
    this.sound = this.createSound();
    scene.events.on(Phaser.Scenes.Events.PAUSE, this.pause, this);
    scene.physics.world.on(Phaser.Physics.Arcade.Events.PAUSE, this.pause, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    owner.once(Phaser.GameObjects.Events.DESTROY, this.destroy, this);
  }

  update(player: { readonly x: number; readonly y: number }, enabled: boolean): void {
    let sound = this.sound;
    if (!sound) {
      return;
    }
    const distance = Phaser.Math.Distance.Between(this.owner.x, this.owner.y, player.x, player.y);
    const volume = this.config.volume * Math.max(0, 1 - distance / this.config.audibleRange);
    if (!enabled || !this.owner.active || volume <= 0) {
      this.stop();
      return;
    }
    if (sound instanceof Phaser.Sound.WebAudioSound || sound instanceof Phaser.Sound.HTML5AudioSound) {
      sound.setVolume(volume);
    }
    if (sound.isPaused) {
      sound.resume();
    } else if (!sound.isPlaying && !this.owner.scene.sound.locked &&
      (!this.hasPlayed || this.config.loop !== false)) {
      if (this.hasPlayed && this.config.variants?.length) {
        sound.destroy();
        sound = this.createSound();
        this.sound = sound;
      }
      if (sound.play({ volume })) {
        this.hasPlayed = true;
      }
    }
  }

  stop(): void {
    this.sound?.stop();
  }

  private createSound(): Phaser.Sound.BaseSound {
    const variants = this.config.variants;
    const key = variants?.length
      ? variants[Math.floor(Math.random() * variants.length)]
      : this.config.key;
    return this.owner.scene.sound.add(key, {
      loop: variants?.length ? false : this.config.loop ?? true,
      volume: this.config.volume,
    });
  }

  private pause(): void {
    if (this.sound?.isPlaying) {
      this.sound.pause();
    }
  }

  private destroy(): void {
    const sound = this.sound;
    if (!sound) {
      return;
    }
    this.sound = null;
    const scene = this.owner.scene;
    scene.events.off(Phaser.Scenes.Events.PAUSE, this.pause, this);
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    scene.physics.world?.off(Phaser.Physics.Arcade.Events.PAUSE, this.pause, this);
    sound.destroy();
  }
}
