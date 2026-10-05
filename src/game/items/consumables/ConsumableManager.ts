import Phaser from "phaser";

import {
  CONSUMABLE_DEFINITIONS,
  CONSUMABLE_PRESENTATION,
} from "../../config/consumables";
import type { Player } from "../../player/Player";
import type { ConsumableType } from "../../types/consumable";
import { ConsumablePickup } from "./ConsumablePickup";
import type { PotionSlot } from "./PotionSlot";

export interface ConsumableFeedback {
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly message: string;
  readonly slotChanged: boolean;
}

export type ConsumableFeedbackHandler = (feedback: ConsumableFeedback) => void;

export class ConsumableManager {
  readonly group: Phaser.Physics.Arcade.StaticGroup;

  private readonly overlap: Phaser.Physics.Arcade.Collider;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    potionSlot: PotionSlot,
    onFeedback: ConsumableFeedbackHandler
  ) {
    this.group = scene.physics.add.staticGroup();
    this.overlap = scene.physics.add.overlap(
      player,
      this.group,
      (_playerObject, pickupObject) => {
        if (
          !(pickupObject instanceof ConsumablePickup) ||
          !pickupObject.active
        ) {
          return;
        }

        const result = potionSlot.add(pickupObject.definition.type);

        if (!result.stored) {
          if (!pickupObject.markUnavailableFeedbackShown()) {
            return;
          }

          onFeedback({
            x: pickupObject.x,
            y: pickupObject.y,
            color: CONSUMABLE_PRESENTATION.fullHealthColor,
            message: result.message,
            slotChanged: false,
          });
          return;
        }

        const feedback = {
          x: pickupObject.x,
          y: pickupObject.y,
          color: pickupObject.definition.color,
          message: result.message,
          slotChanged: true,
        };
        pickupObject.collect();
        onFeedback(feedback);
      }
    );
  }

  spawn(type: ConsumableType, x: number, y: number): ConsumablePickup {
    const pickup = new ConsumablePickup(
      this.group.scene,
      x,
      y,
      CONSUMABLE_DEFINITIONS[type]
    );
    this.group.add(pickup);
    return pickup;
  }

  destroy(): void {
    this.overlap.destroy();
  }
}
