import Phaser from 'phaser';

import { SWORD_CONFIG } from '../config/weapons';
import type { Player } from '../player/Player';
import { AttackKind, type MeleeAttackHandler } from '../types/combat';
import { PrimaryWeapon } from './PrimaryWeapon';

export class SwordWeapon extends PrimaryWeapon {
  readonly attackKind = AttackKind.Melee;
  private readonly onMeleeAttack: MeleeAttackHandler;

  constructor(
    scene: Phaser.Scene,
    owner: Player,
    onMeleeAttack: MeleeAttackHandler,
  ) {
    super(scene, owner);
    this.onMeleeAttack = onMeleeAttack;
  }

  protected performAttack(direction: Phaser.Math.Vector2): void {
    const aimAngle = direction.angle();
    const startAngle = aimAngle - SWORD_CONFIG.swingArc / 2;
    const endAngle = aimAngle + SWORD_CONFIG.swingArc / 2;

    this.onMeleeAttack({
      sourceId: this.owner.playerId,
      amount: this.owner.stats.damage,
      attackKind: this.attackKind,
      origin: new Phaser.Math.Vector2(this.owner.x, this.owner.y),
      direction: direction.clone(),
      range: this.owner.stats.attackRange,
      arc: SWORD_CONFIG.swingArc,
    });

    const blade = this.scene.add
      .rectangle(
        this.owner.x,
        this.owner.y,
        this.owner.stats.attackRange,
        SWORD_CONFIG.bladeThickness,
        SWORD_CONFIG.bladeColor,
        0.9,
      )
      .setOrigin(0, 0.5)
      .setRotation(startAngle)
      .setStrokeStyle(2, SWORD_CONFIG.bladeBorderColor)
      .setDepth(11);

    blade.setData({
      attackKind: this.attackKind,
      damage: this.owner.stats.damage,
      ownerId: this.owner.playerId,
    });

    this.scene.tweens.add({
      targets: blade,
      rotation: endAngle,
      duration: SWORD_CONFIG.swingDurationMs,
      ease: 'Quad.Out',
      onUpdate: () => blade.setPosition(this.owner.x, this.owner.y),
      onComplete: () => blade.destroy(),
    });
  }
}
