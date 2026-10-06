import Phaser from 'phaser';

export const ZOMBIE_TEXTURE_KEYS = {
  walk: 'enemy-zombie',
  attack: 'enemy-zombie-attack',
} as const;

export const ZOMBIE_SPRITE = {
  frameSize: 256,
  scale: 0.27,
  bodyRadius: 78,
  bodyOffsetX: 50,
  bodyOffsetY: 73,
} as const;

const ZOMBIE_FACINGS = ['right', 'left', 'down', 'up'] as const;

export type ZombieFacing = (typeof ZOMBIE_FACINGS)[number];

const FRAME_RANGES: Readonly<
  Record<ZombieFacing, readonly [number, number]>
> = {
  right: [12, 17],
  left: [6, 11],
  down: [0, 5],
  up: [18, 23],
};

export function getZombieWalkAnimationKey(facing: ZombieFacing): string {
  return `zombie-walk-${facing}`;
}

export function getZombieAttackAnimationKey(facing: ZombieFacing): string {
  return `zombie-attack-${facing}`;
}

export function getZombieIdleFrame(facing: ZombieFacing): number {
  return FRAME_RANGES[facing][0];
}

export function getZombieFacing(x: number, y: number): ZombieFacing {
  if (Math.abs(x) > Math.abs(y)) {
    return x >= 0 ? 'right' : 'left';
  }

  return y >= 0 ? 'down' : 'up';
}

export function preloadZombieSprites(scene: Phaser.Scene): void {
  const frameConfig = {
    frameWidth: ZOMBIE_SPRITE.frameSize,
    frameHeight: ZOMBIE_SPRITE.frameSize,
  };

  scene.load.spritesheet(
    ZOMBIE_TEXTURE_KEYS.walk,
    'assets/characters/zombie/Zombie_Walk_with_shadow.png',
    frameConfig,
  );
  scene.load.spritesheet(
    ZOMBIE_TEXTURE_KEYS.attack,
    'assets/characters/zombie/Zombie_Attack_with_shadow.png',
    frameConfig,
  );
}

export function createZombieAnimations(scene: Phaser.Scene): void {
  for (const facing of ZOMBIE_FACINGS) {
    const [start, end] = FRAME_RANGES[facing];
    const walkKey = getZombieWalkAnimationKey(facing);
    const attackKey = getZombieAttackAnimationKey(facing);

    if (!scene.anims.exists(walkKey)) {
      scene.anims.create({
        key: walkKey,
        frames: scene.anims.generateFrameNumbers(ZOMBIE_TEXTURE_KEYS.walk, {
          start,
          end,
        }),
        frameRate: 5,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(attackKey)) {
      scene.anims.create({
        key: attackKey,
        frames: scene.anims.generateFrameNumbers(ZOMBIE_TEXTURE_KEYS.attack, {
          start,
          end,
        }),
        frameRate: 7,
        repeat: 0,
      });
    }
  }
}
