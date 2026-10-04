export enum PlayerClass {
  Warrior = 'WARRIOR',
  Archer = 'ARCHER',
  Mage = 'MAGE',
}

export interface PlayerClassDefinition {
  readonly id: PlayerClass;
  readonly label: string;
  readonly fantasy: string;
  readonly color: number;
  readonly cssColor: string;
}
