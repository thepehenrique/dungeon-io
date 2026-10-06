import Phaser from 'phaser';

export const SKELETON_TEXTURE_KEYS = {
  walk: 'enemy-skeleton-warrior',
  attack: 'enemy-skeleton-warrior-attack',
} as const;

export const SKELETON_SPRITE = {
  frameSize: 256,
  scale: 0.25,
  bodyRadius: 72,
  bodyOffsetX: 56,
  bodyOffsetY: 84,
} as const;

const SKELETON_FACINGS = ['right', 'left', 'down', 'up'] as const;

export type SkeletonFacing = (typeof SKELETON_FACINGS)[number];

const FRAME_RANGES: Readonly<
  Record<SkeletonFacing, readonly [number, number]>
> = {
  right: [12, 17],
  left: [6, 11],
  down: [0, 5],
  up: [18, 23],
};

export function getSkeletonWalkAnimationKey(facing: SkeletonFacing): string {
  return `skeleton-warrior-walk-${facing}`;
}

export function getSkeletonAttackAnimationKey(facing: SkeletonFacing): string {
  return `skeleton-warrior-attack-${facing}`;
}

export function getSkeletonIdleFrame(facing: SkeletonFacing): number {
  return FRAME_RANGES[facing][0];
}

export function getSkeletonFacing(x: number, y: number): SkeletonFacing {
  if (Math.abs(x) > Math.abs(y)) {
    return x >= 0 ? 'right' : 'left';
  }

  return y >= 0 ? 'down' : 'up';
}

export function preloadSkeletonSprites(scene: Phaser.Scene): void {
  const frameConfig = {
    frameWidth: SKELETON_SPRITE.frameSize,
    frameHeight: SKELETON_SPRITE.frameSize,
  };

  scene.load.spritesheet(
    SKELETON_TEXTURE_KEYS.walk,
    'assets/characters/skeleton/Skeleton_Warrior_Walk_with_shadow.png',
    frameConfig,
  );
  scene.load.spritesheet(
    SKELETON_TEXTURE_KEYS.attack,
    'assets/characters/skeleton/Skeleton_Warrior_Attack_with_shadow.png',
    frameConfig,
  );
}

export function createSkeletonAnimations(scene: Phaser.Scene): void {
  for (const facing of SKELETON_FACINGS) {
    const [start, end] = FRAME_RANGES[facing];
    const walkKey = getSkeletonWalkAnimationKey(facing);
    const attackKey = getSkeletonAttackAnimationKey(facing);

    if (!scene.anims.exists(walkKey)) {
      scene.anims.create({
        key: walkKey,
        frames: scene.anims.generateFrameNumbers(SKELETON_TEXTURE_KEYS.walk, {
          start,
          end,
        }),
        frameRate: 7,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(attackKey)) {
      scene.anims.create({
        key: attackKey,
        frames: scene.anims.generateFrameNumbers(SKELETON_TEXTURE_KEYS.attack, {
          start,
          end,
        }),
        frameRate: 9,
        repeat: 0,
      });
    }
  }
}
