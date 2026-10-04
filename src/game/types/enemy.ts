export enum EnemyType {
  Goblin = 'GOBLIN',
  SkeletonWarrior = 'SKELETON_WARRIOR',
  Zombie = 'ZOMBIE',
}

export enum EnemyState {
  Idle = 'IDLE',
  Chase = 'CHASE',
  Attack = 'ATTACK',
  Dead = 'DEAD',
}

export interface EnemyBaseStats {
  readonly maxHealth: number;
  readonly damage: number;
  readonly movementSpeed: number;
  readonly detectionRange: number;
  readonly attackRange: number;
  readonly experienceReward: number;
}

export interface EnemyStats {
  health: number;
  maxHealth: number;
  damage: number;
  movementSpeed: number;
  detectionRange: number;
  attackRange: number;
  experienceReward: number;
}

export interface EnemyDefinition {
  readonly type: EnemyType;
  readonly label: string;
  readonly color: number;
  readonly textureKey: string;
  readonly bodyRadius: number;
  readonly baseStats: Readonly<EnemyBaseStats>;
}

export interface EnemySpawnDefinition {
  readonly type: EnemyType;
  readonly x: number;
  readonly y: number;
  readonly level: number;
}
