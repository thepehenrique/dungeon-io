import Phaser from 'phaser';

export const WARRIOR_TEXTURE_KEYS = {
  walk: 'warrior-novice-walk',
  attack: 'warrior-novice-attack',
} as const;

export const WARRIOR_SPRITE = {
  frameSize: 64,
  scale: 1.5,
  bodyRadius: 12,
  bodyOffsetX: 20,
  bodyOffsetY: 24,
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
  right: [16, 23],
  left: [8, 15],
  down: [0, 7],
  up: [24, 31],
};

export function getWarriorWalkAnimationKey(facing: WarriorFacing): string {
  return `warrior-novice-walk-${facing}`;
}

export function getWarriorAttackAnimationKey(facing: WarriorFacing): string {
  return `warrior-novice-attack-${facing}`;
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
    'assets/characters/warrior/Swordsman_lvl1_Walk_with_shadow.png',
    frameConfig,
  );
  scene.load.spritesheet(
    WARRIOR_TEXTURE_KEYS.attack,
    'assets/characters/warrior/Swordsman_lvl1_attack_with_shadow.png',
    frameConfig,
  );
}

export function createWarriorAnimations(scene: Phaser.Scene): void {
  for (const facing of WARRIOR_FACINGS) {
    const walkKey = getWarriorWalkAnimationKey(facing);
    const attackKey = getWarriorAttackAnimationKey(facing);

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
  }
}
