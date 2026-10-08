import Phaser from 'phaser';

import {
  ARCHER_DASH_CONFIG,
  CLASS_ABILITY_PRESENTATION,
  MAGE_PROTECTION_CONFIG,
  WARRIOR_BLOCK_CONFIG,
} from '../config/classAbilities';
import { PlayerClass } from '../types/player';
import type { Player } from './Player';

export interface AbilityMovement {
  readonly direction: Phaser.Math.Vector2;
  readonly speed: number;
}

export class ClassAbilityController {
  private readonly dashDirection = new Phaser.Math.Vector2();

  private cooldownRemainingMs = 0;
  private activeRemainingMs = 0;
  private blocking = false;

  constructor(private readonly player: Player) {}

  update(
    deltaMs: number,
    spaceHeld: boolean,
    spacePressed: boolean,
    movementDirection: Phaser.Math.Vector2,
    aimDirection: Phaser.Math.Vector2,
  ): void {
    this.cooldownRemainingMs = Math.max(
      0,
      this.cooldownRemainingMs - deltaMs,
    );

    switch (this.player.playerClass) {
      case PlayerClass.Warrior:
        this.updateWarrior(spaceHeld);
        break;
      case PlayerClass.Archer:
        this.updateArcher(deltaMs, spacePressed, movementDirection, aimDirection);
        break;
      case PlayerClass.Mage:
        this.updateMage(deltaMs, spacePressed);
        break;
    }
  }

  resolveMovement(movementDirection: Phaser.Math.Vector2): AbilityMovement {
    if (
      this.player.playerClass === PlayerClass.Archer &&
      this.activeRemainingMs > 0
    ) {
      return {
        direction: this.dashDirection.clone(),
        speed:
          ARCHER_DASH_CONFIG.distance /
          (ARCHER_DASH_CONFIG.durationMs / 1000),
      };
    }

    const movementMultiplier = this.blocking
      ? WARRIOR_BLOCK_CONFIG.movementMultiplier
      : 1;

    return {
      direction: movementDirection.clone(),
      speed: this.player.stats.movementSpeed * movementMultiplier,
    };
  }

  get hudText(): string {
    switch (this.player.playerClass) {
      case PlayerClass.Warrior:
        return this.blocking
          ? CLASS_ABILITY_PRESENTATION.warriorActive
          : CLASS_ABILITY_PRESENTATION.warriorReady;
      case PlayerClass.Archer:
        if (this.activeRemainingMs > 0) {
          return CLASS_ABILITY_PRESENTATION.archerActive;
        }

        return this.cooldownRemainingMs > 0
          ? `[SPACE] DASH ${formatCooldown(this.cooldownRemainingMs)}`
          : CLASS_ABILITY_PRESENTATION.archerReady;
      case PlayerClass.Mage:
        if (this.activeRemainingMs > 0) {
          return CLASS_ABILITY_PRESENTATION.mageActive;
        }

        return this.cooldownRemainingMs > 0
          ? `[SPACE] PROTECTION ${formatCooldown(this.cooldownRemainingMs)}`
          : CLASS_ABILITY_PRESENTATION.mageReady;
    }
  }

  destroy(): void {
    this.suspend();
    this.cooldownRemainingMs = 0;
  }

  suspend(): void {
    this.blocking = false;
    this.activeRemainingMs = 0;
    this.player.setBlocking(false);
    this.player.setDashing(false);
    this.player.setMagicProtection(false);
  }

  private updateWarrior(spaceHeld: boolean): void {
    this.blocking = spaceHeld;
    this.player.setBlocking(spaceHeld);
  }

  private updateArcher(
    deltaMs: number,
    spacePressed: boolean,
    movementDirection: Phaser.Math.Vector2,
    aimDirection: Phaser.Math.Vector2,
  ): void {
    if (this.activeRemainingMs > 0) {
      this.activeRemainingMs = Math.max(0, this.activeRemainingMs - deltaMs);

      if (this.activeRemainingMs === 0) {
        this.player.setDashing(false);
      }
    }

    if (
      !spacePressed ||
      this.cooldownRemainingMs > 0 ||
      this.activeRemainingMs > 0
    ) {
      return;
    }

    this.dashDirection.copy(
      movementDirection.lengthSq() > 0 ? movementDirection : aimDirection,
    );

    if (this.dashDirection.lengthSq() === 0) {
      return;
    }

    this.dashDirection.normalize();
    this.activeRemainingMs = ARCHER_DASH_CONFIG.durationMs;
    this.cooldownRemainingMs = ARCHER_DASH_CONFIG.cooldownMs;
    this.player.setDashing(true, this.dashDirection);
  }

  private updateMage(deltaMs: number, spacePressed: boolean): void {
    if (this.activeRemainingMs > 0) {
      this.activeRemainingMs = Math.max(0, this.activeRemainingMs - deltaMs);

      if (this.activeRemainingMs === 0) {
        this.player.setMagicProtection(false);
      }
    }

    if (
      !spacePressed ||
      this.cooldownRemainingMs > 0 ||
      this.activeRemainingMs > 0
    ) {
      return;
    }

    this.activeRemainingMs = MAGE_PROTECTION_CONFIG.durationMs;
    this.cooldownRemainingMs = MAGE_PROTECTION_CONFIG.cooldownMs;
    this.player.setMagicProtection(true);
  }
}

function formatCooldown(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(1)}s`;
}
