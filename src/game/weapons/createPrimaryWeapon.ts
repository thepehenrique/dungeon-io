import Phaser from 'phaser';

import type { Player } from '../player/Player';
import type { ProjectileManager } from '../projectiles/ProjectileManager';
import type { MeleeAttackHandler } from '../types/combat';
import { PlayerClass } from '../types/player';
import { ArrowWeapon } from './ArrowWeapon';
import { FireballWeapon } from './FireballWeapon';
import type { PrimaryWeapon } from './PrimaryWeapon';
import { SwordWeapon } from './SwordWeapon';

export function createPrimaryWeapon(
  scene: Phaser.Scene,
  player: Player,
  projectiles: ProjectileManager,
  onMeleeAttack: MeleeAttackHandler,
): PrimaryWeapon {
  switch (player.playerClass) {
    case PlayerClass.Warrior:
      return new SwordWeapon(scene, player, onMeleeAttack);
    case PlayerClass.Archer:
      return new ArrowWeapon(scene, player, projectiles);
    case PlayerClass.Mage:
      return new FireballWeapon(scene, player, projectiles);
  }
}
