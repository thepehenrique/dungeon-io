import Phaser from 'phaser';

import type { Player } from './Player';
import { ClassAbilityController } from './ClassAbilityController';
import type { PrimaryWeapon } from '../weapons/PrimaryWeapon';

interface InputKeys {
  readonly up: Phaser.Input.Keyboard.Key;
  readonly left: Phaser.Input.Keyboard.Key;
  readonly down: Phaser.Input.Keyboard.Key;
  readonly right: Phaser.Input.Keyboard.Key;
  readonly usePotion: Phaser.Input.Keyboard.Key;
  readonly classAbility: Phaser.Input.Keyboard.Key;
}

export class PlayerController {
  private readonly scene: Phaser.Scene;
  private readonly player: Player;
  private readonly primaryWeapon: PrimaryWeapon;
  readonly classAbility: ClassAbilityController;

  private readonly keys: InputKeys;
  private readonly onUsePotion: () => void;
  private readonly movement = new Phaser.Math.Vector2();

  constructor(
    scene: Phaser.Scene,
    player: Player,
    primaryWeapon: PrimaryWeapon,
    onUsePotion: () => void,
  ) {
    if (!scene.input.keyboard) {
      throw new Error('Keyboard input is not available.');
    }

    this.scene = scene;
    this.player = player;
    this.primaryWeapon = primaryWeapon;
    this.onUsePotion = onUsePotion;
    this.classAbility = new ClassAbilityController(player);
    this.keys = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      usePotion: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      classAbility: scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      ),
    };
  }

  update(deltaMs: number): void {
    if (this.player.isDead) {
      this.movement.set(0, 0);
      this.player.move(this.movement);
      return;
    }

    const horizontal = Number(this.keys.right.isDown) - Number(this.keys.left.isDown);
    const vertical = Number(this.keys.down.isDown) - Number(this.keys.up.isDown);
    this.movement.set(horizontal, vertical);

    const pointerPosition = this.scene.input.activePointer.positionToCamera(
      this.scene.cameras.main,
    ) as Phaser.Math.Vector2;
    this.player.face(pointerPosition.x, pointerPosition.y);

    const aimDirection = new Phaser.Math.Vector2(
      pointerPosition.x - this.player.x,
      pointerPosition.y - this.player.y,
    );

    if (aimDirection.lengthSq() > 0) {
      aimDirection.normalize();
    }

    this.classAbility.update(
      deltaMs,
      this.keys.classAbility.isDown,
      Phaser.Input.Keyboard.JustDown(this.keys.classAbility),
      this.movement,
      aimDirection,
    );
    const abilityMovement = this.classAbility.resolveMovement(this.movement);
    this.player.move(abilityMovement.direction, abilityMovement.speed);

    if (this.scene.input.activePointer.leftButtonDown()) {
      this.primaryWeapon.tryAttack(pointerPosition);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.usePotion)) {
      this.onUsePotion();
    }
  }

  destroy(): void {
    this.classAbility.destroy();

    for (const key of Object.values(this.keys)) {
      this.scene.input.keyboard?.removeKey(key, true, true);
    }
  }
}
