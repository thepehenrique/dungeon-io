import Phaser from 'phaser';

export const WARRIOR_TEXTURE_KEYS = {
  walk: 'warrior-shield-walk',
  attack: 'warrior-shield-attack',
  block: 'warrior-shield-block',
} as const;

export const WARRIOR_SPRITE = {
  frameSize: 256,
  scale: 0.25,
  bodyRadius: 70,
  bodyOffsetX: 58,
  bodyOffsetY: 95,
} as const;

const WARRIOR_FACINGS = ['right', 'left', 'down', 'up'] as const;

export type WarriorFacing = (typeof WARRIOR_FACINGS)[number];

const WALK_FRAME_RANGES: Readonly<Record<WarriorFacing, readonly [number, number]>> = {
  right: [12, 17],
  left: [6, 11],
  down: [0, 5],
  up: [18, 23],
};

const ATTACK_FRAME_RANGES: Readonly<Record<WarriorFacing, readonly [number, number]>> = {
  right: [12, 17],
  left: [6, 11],
  down: [0, 5],
  up: [18, 23],
};

const BLOCK_FRAME_RANGES: Readonly<
  Record<WarriorFacing, readonly [number, number]>
> = {
  right: [12, 14],
  left: [6, 8],
  down: [0, 2],
  up: [18, 20],
};

export function getWarriorWalkAnimationKey(facing: WarriorFacing): string {
  return `warrior-shield-walk-${facing}`;
}

export function getWarriorAttackAnimationKey(facing: WarriorFacing): string {
  return `warrior-shield-attack-${facing}`;
}

export function getWarriorBlockAnimationKey(facing: WarriorFacing): string {
  return `warrior-shield-block-${facing}`;
}

export function getWarriorIdleFrame(facing: WarriorFacing): number {
  return WALK_FRAME_RANGES[facing][0];
}

export function getWarriorFacing(x: number, y: number): WarriorFacing {
  if (Math.abs(x) > Math.abs(y)) {
    return x >= 0 ? 'right' : 'left';
  }

  return y >= 0 ? 'down' : 'up';
}

export function preloadWarriorSprites(scene: Phaser.Scene): void {
  const frameConfig = {
    frameWidth: WARRIOR_SPRITE.frameSize,
    frameHeight: WARRIOR_SPRITE.frameSize,
  };

  scene.load.spritesheet(
    WARRIOR_TEXTURE_KEYS.walk,
    'assets/characters/warrior/Warrior_Shield_Walk.png',
    frameConfig,
  );
  scene.load.spritesheet(
    WARRIOR_TEXTURE_KEYS.attack,
    'assets/characters/warrior/Warrior_Shield_Attack.png',
    frameConfig,
  );
  scene.load.spritesheet(
    WARRIOR_TEXTURE_KEYS.block,
    'assets/characters/warrior/Warrior_Shield_Block.png',
    frameConfig,
  );
}

export function createWarriorAnimations(scene: Phaser.Scene): void {
  for (const facing of WARRIOR_FACINGS) {
    const walkKey = getWarriorWalkAnimationKey(facing);
    const attackKey = getWarriorAttackAnimationKey(facing);
    const blockKey = getWarriorBlockAnimationKey(facing);

    if (!scene.anims.exists(walkKey)) {
      const [start, end] = WALK_FRAME_RANGES[facing];
      scene.anims.create({
        key: walkKey,
        frames: scene.anims.generateFrameNumbers(WARRIOR_TEXTURE_KEYS.walk, {
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
        frames: scene.anims.generateFrameNumbers(WARRIOR_TEXTURE_KEYS.attack, {
          start,
          end,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!scene.anims.exists(blockKey)) {
      const [start, end] = BLOCK_FRAME_RANGES[facing];
      scene.anims.create({
        key: blockKey,
        frames: scene.anims.generateFrameNumbers(WARRIOR_TEXTURE_KEYS.block, {
          start,
          end,
        }),
        frameRate: 8,
        repeat: 0,
      });
    }
  }
}
