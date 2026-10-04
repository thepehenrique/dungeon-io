import Phaser from 'phaser';

import type { Player } from './Player';

interface MovementKeys {
  readonly up: Phaser.Input.Keyboard.Key;
  readonly left: Phaser.Input.Keyboard.Key;
  readonly down: Phaser.Input.Keyboard.Key;
  readonly right: Phaser.Input.Keyboard.Key;
}

export class PlayerController {
  private readonly scene: Phaser.Scene;
  private readonly player: Player;
  private readonly keys: MovementKeys;
  private readonly movement = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene, player: Player) {
    if (!scene.input.keyboard) {
      throw new Error('Keyboard input is not available.');
    }

    this.scene = scene;
    this.player = player;
    this.keys = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(): void {
    const horizontal = Number(this.keys.right.isDown) - Number(this.keys.left.isDown);
    const vertical = Number(this.keys.down.isDown) - Number(this.keys.up.isDown);
    this.movement.set(horizontal, vertical);
    this.player.move(this.movement);

    const pointerPosition = this.scene.input.activePointer.positionToCamera(
      this.scene.cameras.main,
    ) as Phaser.Math.Vector2;
    this.player.face(pointerPosition.x, pointerPosition.y);
  }

  destroy(): void {
    for (const key of Object.values(this.keys)) {
      this.scene.input.keyboard?.removeKey(key, true);
    }
  }
}
