import Phaser from 'phaser';

import type { Player } from './Player';
import { ClassAbilityController } from './ClassAbilityController';
import type { PrimaryWeapon } from '../weapons/PrimaryWeapon';

interface InputKeys {
  readonly up: Phaser.Input.Keyboard.Key;
  readonly left: Phaser.Input.Keyboard.Key;
  readonly down: Phaser.Input.Keyboard.Key;
  readonly right: Phaser.Input.Keyboard.Key;
  readonly interact: Phaser.Input.Keyboard.Key;
  readonly quickSlot1: Phaser.Input.Keyboard.Key;
  readonly quickSlot2: Phaser.Input.Keyboard.Key;
  readonly quickSlot3: Phaser.Input.Keyboard.Key;
  readonly classAbility: Phaser.Input.Keyboard.Key;
}

export class PlayerController {
  private readonly scene: Phaser.Scene;
  private readonly player: Player;
  private readonly primaryWeapon: PrimaryWeapon;
  readonly classAbility: ClassAbilityController;

  private readonly keys: InputKeys;
  private readonly onInteract: () => void;
  private readonly onUseQuickSlot: (index: number) => void;
  private readonly movement = new Phaser.Math.Vector2();

  constructor(
    scene: Phaser.Scene,
    player: Player,
    primaryWeapon: PrimaryWeapon,
    onInteract: () => void,
    onUseQuickSlot: (index: number) => void,
  ) {
    if (!scene.input.keyboard) {
      throw new Error('Keyboard input is not available.');
    }

    this.scene = scene;
    this.player = player;
    this.primaryWeapon = primaryWeapon;
    this.onInteract = onInteract;
    this.onUseQuickSlot = onUseQuickSlot;
    this.classAbility = new ClassAbilityController(player);
    this.keys = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      interact: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      quickSlot1: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      quickSlot2: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      quickSlot3: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
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

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      this.onInteract();
    }

    const quickSlotKeys = [
      this.keys.quickSlot1,
      this.keys.quickSlot2,
      this.keys.quickSlot3,
    ];

    for (let index = 0; index < quickSlotKeys.length; index += 1) {
      if (Phaser.Input.Keyboard.JustDown(quickSlotKeys[index])) {
        this.onUseQuickSlot(index);
      }
    }
  }

  discardActionPresses(): void {
    Phaser.Input.Keyboard.JustDown(this.keys.interact);
    Phaser.Input.Keyboard.JustDown(this.keys.quickSlot1);
    Phaser.Input.Keyboard.JustDown(this.keys.quickSlot2);
    Phaser.Input.Keyboard.JustDown(this.keys.quickSlot3);
    Phaser.Input.Keyboard.JustDown(this.keys.classAbility);
  }

  destroy(): void {
    this.classAbility.destroy();

    for (const key of Object.values(this.keys)) {
      this.scene.input.keyboard?.removeKey(key, true, true);
    }
  }
}
