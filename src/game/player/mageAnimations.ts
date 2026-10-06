import Phaser from 'phaser';

export const MAGE_TEXTURE_KEYS = {
  walk: 'mage-novice-walk',
  cast: 'mage-novice-cast',
} as const;

export const MAGE_SPRITE = {
  frameSize: 256,
  scale: 0.27,
  bodyRadius: 67,
  bodyOffsetX: 61,
  bodyOffsetY: 91,
} as const;

const MAGE_FACINGS = ['right', 'left', 'down', 'up'] as const;

export type MageFacing = (typeof MAGE_FACINGS)[number];

const FRAME_RANGES: Readonly<Record<MageFacing, readonly [number, number]>> = {
  right: [12, 17],
  left: [6, 11],
  down: [0, 5],
  up: [18, 23],
};

export function getMageWalkAnimationKey(facing: MageFacing): string {
  return `mage-novice-walk-${facing}`;
}

export function getMageCastAnimationKey(facing: MageFacing): string {
  return `mage-novice-cast-${facing}`;
}

export function getMageIdleFrame(facing: MageFacing): number {
  return FRAME_RANGES[facing][0];
}

export function getMageFacing(x: number, y: number): MageFacing {
  if (Math.abs(x) > Math.abs(y)) {
    return x >= 0 ? 'right' : 'left';
  }

  return y >= 0 ? 'down' : 'up';
}

export function preloadMageSprites(scene: Phaser.Scene): void {
  const frameConfig = {
    frameWidth: MAGE_SPRITE.frameSize,
    frameHeight: MAGE_SPRITE.frameSize,
  };

  scene.load.spritesheet(
    MAGE_TEXTURE_KEYS.walk,
    'assets/characters/mage/Mage_Novice_Walk_with_shadow.png',
    frameConfig,
  );
  scene.load.spritesheet(
    MAGE_TEXTURE_KEYS.cast,
    'assets/characters/mage/Mage_Novice_Cast_with_shadow.png',
    frameConfig,
  );
}

export function createMageAnimations(scene: Phaser.Scene): void {
  for (const facing of MAGE_FACINGS) {
    const [start, end] = FRAME_RANGES[facing];
    const walkKey = getMageWalkAnimationKey(facing);
    const castKey = getMageCastAnimationKey(facing);

    if (!scene.anims.exists(walkKey)) {
      scene.anims.create({
        key: walkKey,
        frames: scene.anims.generateFrameNumbers(MAGE_TEXTURE_KEYS.walk, {
          start,
          end,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(castKey)) {
      scene.anims.create({
        key: castKey,
        frames: scene.anims.generateFrameNumbers(MAGE_TEXTURE_KEYS.cast, {
          start,
          end,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }
  }
}
