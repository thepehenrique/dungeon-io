import Phaser from 'phaser';

export const GOBLIN_TEXTURE_KEYS = {
  walk: 'enemy-goblin',
  attack: 'enemy-goblin-attack',
} as const;

export const GOBLIN_SPRITE = {
  frameSize: 256,
  scale: 0.28,
  bodyRadius: 57,
  bodyOffsetX: 71,
  bodyOffsetY: 114,
} as const;

const GOBLIN_FACINGS = ['right', 'left', 'down', 'up'] as const;

export type GoblinFacing = (typeof GOBLIN_FACINGS)[number];

const WALK_FRAME_RANGES: Readonly<
  Record<GoblinFacing, readonly [number, number]>
> = {
  right: [12, 17],
  left: [6, 11],
  down: [0, 5],
  up: [18, 23],
};

const ATTACK_FRAME_RANGES = WALK_FRAME_RANGES;

export function getGoblinWalkAnimationKey(facing: GoblinFacing): string {
  return `goblin-walk-${facing}`;
}

export function getGoblinAttackAnimationKey(facing: GoblinFacing): string {
  return `goblin-attack-${facing}`;
}

export function getGoblinIdleFrame(facing: GoblinFacing): number {
  return WALK_FRAME_RANGES[facing][0];
}

export function getGoblinFacing(x: number, y: number): GoblinFacing {
  if (Math.abs(x) > Math.abs(y)) {
    return x >= 0 ? 'right' : 'left';
  }

  return y >= 0 ? 'down' : 'up';
}

export function preloadGoblinSprites(scene: Phaser.Scene): void {
  scene.load.spritesheet(
    GOBLIN_TEXTURE_KEYS.walk,
    'assets/characters/goblin/Goblin_Walk_with_shadow.png',
    {
      frameWidth: GOBLIN_SPRITE.frameSize,
      frameHeight: GOBLIN_SPRITE.frameSize,
    },
  );
  scene.load.spritesheet(
    GOBLIN_TEXTURE_KEYS.attack,
    'assets/characters/goblin/Goblin_Attack_with_shadow.png',
    {
      frameWidth: GOBLIN_SPRITE.frameSize,
      frameHeight: GOBLIN_SPRITE.frameSize,
    },
  );
}

export function createGoblinAnimations(scene: Phaser.Scene): void {
  for (const facing of GOBLIN_FACINGS) {
    const walkKey = getGoblinWalkAnimationKey(facing);
    const attackKey = getGoblinAttackAnimationKey(facing);

    if (!scene.anims.exists(walkKey)) {
      const [start, end] = WALK_FRAME_RANGES[facing];
      scene.anims.create({
        key: walkKey,
        frames: scene.anims.generateFrameNumbers(GOBLIN_TEXTURE_KEYS.walk, {
          start,
          end,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(attackKey)) {
      const [start, end] = ATTACK_FRAME_RANGES[facing];
      scene.anims.create({
        key: attackKey,
        frames: scene.anims.generateFrameNumbers(GOBLIN_TEXTURE_KEYS.attack, {
          start,
          end,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }
  }
}
