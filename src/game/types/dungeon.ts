export interface WallDefinition {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export enum DungeonRoomType {
  Combat = 'COMBAT',
  Treasure = 'TREASURE',
}

export interface DungeonRoomDefinition {
  readonly id: string;
  readonly type: DungeonRoomType;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export enum DungeonDecorationType {
  Torch = 'TORCH',
  Barrel = 'BARREL',
  Crate = 'CRATE',
  Bones = 'BONES',
  Web = 'WEB',
}

export interface DungeonDecorationDefinition {
  readonly type: DungeonDecorationType;
  readonly x: number;
  readonly y: number;
  readonly rotation?: number;
  readonly collidable?: boolean;
}

export interface DarkZoneDefinition {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly alpha: number;
}
