export enum PlayerClass {
  Warrior = 'WARRIOR',
  Archer = 'ARCHER',
  Mage = 'MAGE',
}

export interface PlayerBaseStats {
  readonly maxHealth: number;
  readonly damage: number;
  readonly defense: number;
  readonly movementSpeed: number;
  /** Number of attacks allowed per second. */
  readonly attackSpeed: number;
  readonly attackRange: number;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
  movementSpeed: number;
  attackSpeed: number;
  attackRange: number;
}

export interface PlayerClassDefinition {
  readonly id: PlayerClass;
  readonly label: string;
  readonly fantasy: string;
  readonly color: number;
  readonly cssColor: string;
  readonly baseStats: Readonly<PlayerBaseStats>;
}
