import Phaser from 'phaser';

import { DROP_CONFIG, DROP_TABLES } from '../config/drops';
import { GoldPickup } from '../items/world/GoldPickup';
import type { WorldItem } from '../items/world/WorldItem';
import { WorldItemManager } from '../items/world/WorldItemManager';
import type { Player } from '../player/Player';
import type { RunState } from '../types/run';
import {
  type DropContext,
  type DropResult,
  type DropTableId,
} from '../types/drop';
import type { ItemInstance } from '../types/item';
import { rollDropTable } from './DropRoller';

export interface GoldCollectedFeedback {
  readonly x: number;
  readonly y: number;
  readonly quantity: number;
}

export type GoldCollectedHandler = (feedback: GoldCollectedFeedback) => void;

export class DropSystem {
  private readonly worldItems: WorldItemManager;
  private readonly goldGroup: Phaser.Physics.Arcade.StaticGroup;
  private readonly goldOverlap: Phaser.Physics.Arcade.Collider;
  private spawnSequence = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    player: Player,
    private readonly run: RunState,
    private readonly walls: Phaser.Physics.Arcade.StaticGroup,
    private readonly onGoldCollected: GoldCollectedHandler,
    private readonly random: () => number = Math.random,
  ) {
    this.worldItems = new WorldItemManager(scene);
    this.goldGroup = scene.physics.add.staticGroup();
    this.goldOverlap = scene.physics.add.overlap(
      player,
      this.goldGroup,
      (_playerObject, goldObject) => {
        if (!(goldObject instanceof GoldPickup) || !goldObject.active) {
          return;
        }

        const feedback = {
          x: goldObject.x,
          y: goldObject.y,
          quantity: goldObject.quantity,
        };
        this.run.gold += goldObject.quantity;
        goldObject.collect();
        this.onGoldCollected(feedback);
      },
    );
  }

  roll(tableId: DropTableId, context: DropContext): readonly DropResult[] {
    return rollDropTable(DROP_TABLES[tableId], context, this.random);
  }

  spawnDrops(
    tableId: DropTableId,
    x: number,
    y: number,
    context: DropContext,
  ): readonly DropResult[] {
    const results = this.roll(tableId, context);

    for (const result of results) {
      const position = this.findSpawnPosition(x, y, this.spawnSequence);
      this.spawnSequence += 1;

      if (result.type === 'GOLD') {
        const pickup = new GoldPickup(
          this.scene,
          position.x,
          position.y,
          result.quantity,
        );
        this.goldGroup.add(pickup);
        continue;
      }

      this.worldItems.spawn(
        result.definitionId,
        result.quantity,
        position.x,
        position.y,
      );
    }

    return results;
  }

  getWorldItems(): ReturnType<WorldItemManager['getItems']> {
    return this.worldItems.getItems();
  }

  collectWorldItem(item: WorldItem): void {
    this.worldItems.remove(item);
  }

  spawnExistingItem(
    instance: ItemInstance,
    quantity: number,
    x: number,
    y: number,
  ): WorldItem {
    const position = this.findSpawnPosition(x, y, this.spawnSequence);
    this.spawnSequence += 1;
    return this.worldItems.spawnInstance(
      instance,
      quantity,
      position.x,
      position.y,
    );
  }

  destroy(): void {
    this.goldOverlap.destroy();
    this.worldItems.destroy();
  }

  private findSpawnPosition(
    originX: number,
    originY: number,
    sequence: number,
  ): Phaser.Math.Vector2 {
    const worldBounds = this.scene.physics.world.bounds;
    const goldenAngle = 2.399963229728653;

    for (let attempt = 0; attempt < DROP_CONFIG.spawnAttempts; attempt += 1) {
      const angle =
        this.random() * Math.PI * 2 +
        (sequence + attempt) * goldenAngle;
      const distance = Phaser.Math.Linear(
        DROP_CONFIG.spawnOffsetMinimum,
        DROP_CONFIG.spawnOffsetMaximum,
        this.random(),
      );
      const x = Phaser.Math.Clamp(
        originX + Math.cos(angle) * distance,
        worldBounds.left + DROP_CONFIG.wallPadding,
        worldBounds.right - DROP_CONFIG.wallPadding,
      );
      const y = Phaser.Math.Clamp(
        originY + Math.sin(angle) * distance,
        worldBounds.top + DROP_CONFIG.wallPadding,
        worldBounds.bottom - DROP_CONFIG.wallPadding,
      );

      if (!this.isInsideWall(x, y)) {
        return new Phaser.Math.Vector2(x, y);
      }
    }

    const fallbackAngle = sequence * goldenAngle;
    return new Phaser.Math.Vector2(
      Phaser.Math.Clamp(
        originX + Math.cos(fallbackAngle) * DROP_CONFIG.spawnOffsetMinimum,
        worldBounds.left + DROP_CONFIG.wallPadding,
        worldBounds.right - DROP_CONFIG.wallPadding,
      ),
      Phaser.Math.Clamp(
        originY + Math.sin(fallbackAngle) * DROP_CONFIG.spawnOffsetMinimum,
        worldBounds.top + DROP_CONFIG.wallPadding,
        worldBounds.bottom - DROP_CONFIG.wallPadding,
      ),
    );
  }

  private isInsideWall(x: number, y: number): boolean {
    for (const child of this.walls.getChildren()) {
      if (!(child instanceof Phaser.GameObjects.Rectangle)) {
        continue;
      }

      const bounds = child.getBounds();
      const padding = DROP_CONFIG.wallPadding;

      if (
        x >= bounds.left - padding &&
        x <= bounds.right + padding &&
        y >= bounds.top - padding &&
        y <= bounds.bottom + padding
      ) {
        return true;
      }
    }

    return false;
  }
}
