import Phaser from 'phaser';

export const ARCHER_TEXTURE_KEYS = {
  walk: 'archer-novice-walk',
  attack: 'archer-novice-attack',
} as const;

export const ARCHER_SPRITE = {
  frameSize: 256,
  scale: 0.3125,
  bodyRadius: 56,
  bodyOffsetX: 72,
  bodyOffsetY: 110,
} as const;

const ARCHER_FACINGS = ['right', 'left', 'down', 'up'] as const;

export type ArcherFacing = (typeof ARCHER_FACINGS)[number];

const FRAME_RANGES: Readonly<Record<ArcherFacing, readonly [number, number]>> = {
  right: [12, 17],
  left: [6, 11],
  down: [0, 5],
  up: [18, 23],
};

export function getArcherWalkAnimationKey(facing: ArcherFacing): string {
  return `archer-novice-walk-${facing}`;
}

export function getArcherAttackAnimationKey(facing: ArcherFacing): string {
  return `archer-novice-attack-${facing}`;
}

export function getArcherIdleFrame(facing: ArcherFacing): number {
  return FRAME_RANGES[facing][0];
}

export function getArcherFacing(x: number, y: number): ArcherFacing {
  if (Math.abs(x) > Math.abs(y)) {
    return x >= 0 ? 'right' : 'left';
  }

  return y >= 0 ? 'down' : 'up';
}

export function preloadArcherSprites(scene: Phaser.Scene): void {
  const frameConfig = {
    frameWidth: ARCHER_SPRITE.frameSize,
    frameHeight: ARCHER_SPRITE.frameSize,
  };

  scene.load.spritesheet(
    ARCHER_TEXTURE_KEYS.walk,
    'assets/characters/archer/Archer_novice_Walk_with_shadow.png',
    frameConfig,
  );
  scene.load.spritesheet(
    ARCHER_TEXTURE_KEYS.attack,
    'assets/characters/archer/Archer_novice_attack_with_shadow.png',
    frameConfig,
  );
}

export function createArcherAnimations(scene: Phaser.Scene): void {
  for (const facing of ARCHER_FACINGS) {
    const [start, end] = FRAME_RANGES[facing];
    const walkKey = getArcherWalkAnimationKey(facing);
    const attackKey = getArcherAttackAnimationKey(facing);

    if (!scene.anims.exists(walkKey)) {
      scene.anims.create({
        key: walkKey,
        frames: scene.anims.generateFrameNumbers(ARCHER_TEXTURE_KEYS.walk, {
          start,
          end,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(attackKey)) {
      scene.anims.create({
        key: attackKey,
        frames: scene.anims.generateFrameNumbers(ARCHER_TEXTURE_KEYS.attack, {
          start,
          end,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }
  }
}
