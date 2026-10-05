export enum ConsumableType {
  MinorHealthPotion = 'MINOR_HEALTH_POTION',
  MajorHealthPotion = 'MAJOR_HEALTH_POTION',
}

export enum ConsumableEffectType {
  RestoreHealth = 'RESTORE_HEALTH',
}

export interface RestoreHealthEffect {
  readonly type: ConsumableEffectType.RestoreHealth;
  readonly amount: number;
}

export type ConsumableEffect = RestoreHealthEffect;

export interface ConsumableDefinition {
  readonly id: string;
  readonly type: ConsumableType;
  readonly label: string;
  readonly color: string;
  readonly textureKey: string;
  readonly pickupRadius: number;
  readonly effect: ConsumableEffect;
}

export interface ConsumableUseResult {
  readonly consumed: boolean;
  readonly appliedAmount: number;
  readonly message: string;
}

export interface PotionSlotState {
  type: ConsumableType | null;
  quantity: number;
}
