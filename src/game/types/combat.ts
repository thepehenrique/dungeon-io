export enum AttackKind {
  Melee = 'MELEE',
  Projectile = 'PROJECTILE',
  Magic = 'MAGIC',
}

export interface ProjectileDefinition {
  readonly textureKey: string;
  readonly speed: number;
  readonly bodyRadius: number;
  readonly spawnOffset: number;
}
