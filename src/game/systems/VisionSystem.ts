import Phaser from 'phaser';

import { VISION_CONFIG } from '../config/vision';
import type { VisionBlocker } from '../dungeon/TilemapDungeon';

interface VisionOrigin {
  readonly x: number;
  readonly y: number;
}

const FULL_CIRCLE = Math.PI * 2;

export class VisionSystem {
  private readonly blockers: readonly VisionBlocker[];
  private readonly nearbyBlockers: VisionBlocker[] = [];
  private readonly rayAngles: number[] = [];
  private readonly hitPoints: Phaser.Math.Vector2[] = [];
  private readonly maskGraphics: Phaser.GameObjects.Graphics;
  private readonly atmosphereGraphics: Phaser.GameObjects.Graphics;
  private readonly fogGraphics: Phaser.GameObjects.Graphics;
  private readonly debugGraphics: Phaser.GameObjects.Graphics | null;
  private readonly fogMask: Phaser.Display.Masks.GeometryMask;
  private elapsedMs = Number.POSITIVE_INFINITY;
  private lastX = Number.NaN;
  private lastY = Number.NaN;

  constructor(
    scene: Phaser.Scene,
    private readonly origin: VisionOrigin,
    blockers: readonly VisionBlocker[],
    worldWidth: number,
    worldHeight: number,
  ) {
    this.blockers = blockers.map((blocker) => ({ ...blocker }));
    this.maskGraphics = scene.make.graphics();
    this.fogMask = this.maskGraphics.createGeometryMask().setInvertAlpha(true);

    this.atmosphereGraphics = scene.add
      .graphics()
      .fillStyle(VISION_CONFIG.fogColor, VISION_CONFIG.visibleAreaAlpha)
      .fillRect(0, 0, worldWidth, worldHeight)
      .setDepth(VISION_CONFIG.worldDepth);

    this.fogGraphics = scene.add
      .graphics()
      .fillStyle(VISION_CONFIG.fogColor, VISION_CONFIG.fogAlpha)
      .fillRect(0, 0, worldWidth, worldHeight)
      .setDepth(VISION_CONFIG.worldDepth + 1)
      .setMask(this.fogMask);

    this.debugGraphics = VISION_CONFIG.debug
      ? scene.add.graphics().setDepth(VISION_CONFIG.worldDepth + 2)
      : null;

    this.calculateVisibility();
  }

  update(delta: number, enabled: boolean): void {
    if (!enabled) {
      return;
    }

    this.elapsedMs += delta;
    const movedEnough =
      !Number.isFinite(this.lastX) ||
      Phaser.Math.Distance.Squared(
        this.origin.x,
        this.origin.y,
        this.lastX,
        this.lastY,
      ) >= VISION_CONFIG.movementThreshold ** 2;

    if (this.elapsedMs < VISION_CONFIG.updateIntervalMs || !movedEnough) {
      return;
    }

    this.calculateVisibility();
  }

  hasLineOfSight(targetX: number, targetY: number): boolean {
    const offsetX = targetX - this.origin.x;
    const offsetY = targetY - this.origin.y;
    const distance = Math.hypot(offsetX, offsetY);

    if (distance > VISION_CONFIG.radius) {
      return false;
    }

    return hasLineOfSightBetween(
      this.origin.x,
      this.origin.y,
      targetX,
      targetY,
      this.blockers,
    );
  }

  destroy(): void {
    this.fogGraphics.clearMask(true);
    this.maskGraphics.destroy();
    this.atmosphereGraphics.destroy();
    this.fogGraphics.destroy();
    this.debugGraphics?.destroy();
    this.nearbyBlockers.length = 0;
    this.rayAngles.length = 0;
    this.hitPoints.length = 0;
  }

  private calculateVisibility(): void {
    const originX = this.origin.x;
    const originY = this.origin.y;
    const radius = VISION_CONFIG.radius;

    this.collectNearbyBlockers(originX, originY, radius);
    this.rayAngles.length = 0;

    for (let index = 0; index < VISION_CONFIG.rayCount; index += 1) {
      this.rayAngles.push((index / VISION_CONFIG.rayCount) * FULL_CIRCLE);
    }

    for (const blocker of this.nearbyBlockers) {
      this.addCornerRays(originX, originY, blocker.x, blocker.y);
      this.addCornerRays(originX, originY, blocker.x + blocker.width, blocker.y);
      this.addCornerRays(originX, originY, blocker.x, blocker.y + blocker.height);
      this.addCornerRays(
        originX,
        originY,
        blocker.x + blocker.width,
        blocker.y + blocker.height,
      );
    }

    this.rayAngles.sort((first, second) => first - second);
    this.ensurePointCapacity(this.rayAngles.length);

    for (let index = 0; index < this.rayAngles.length; index += 1) {
      const angle = this.rayAngles[index];
      const directionX = Math.cos(angle);
      const directionY = Math.sin(angle);
      const distance = this.castRay(
        originX,
        originY,
        directionX,
        directionY,
        radius,
        this.nearbyBlockers,
      );
      this.hitPoints[index].set(
        originX + directionX * distance,
        originY + directionY * distance,
      );
    }

    this.drawVisibilityMask(originX, originY);

    if (this.debugGraphics) {
      this.debugGraphics.clear();
      this.drawVisibilityPolygon(this.debugGraphics, 0x44d9ff, 0.12);
      this.debugGraphics.lineStyle(1, 0x44d9ff, 0.65);
      this.debugGraphics.strokeCircle(originX, originY, radius);
      this.debugGraphics.beginPath();
      for (let index = 0; index < this.rayAngles.length; index += 1) {
        this.debugGraphics.moveTo(originX, originY);
        this.debugGraphics.lineTo(
          this.hitPoints[index].x,
          this.hitPoints[index].y,
        );
      }
      this.debugGraphics.strokePath();

      this.debugGraphics.fillStyle(0xffd166, 0.9);
      for (let index = 0; index < this.rayAngles.length; index += 1) {
        this.debugGraphics.fillCircle(
          this.hitPoints[index].x,
          this.hitPoints[index].y,
          2,
        );
      }

      this.debugGraphics.lineStyle(1, 0xff5f56, 0.9);
      for (const blocker of this.nearbyBlockers) {
        this.debugGraphics.strokeRect(
          blocker.x,
          blocker.y,
          blocker.width,
          blocker.height,
        );
      }

      this.drawVisibleBlockers(
        this.debugGraphics,
        originX,
        originY,
        0xffd166,
        0.22,
      );
    }

    this.hitPoints.length = this.rayAngles.length;
    this.lastX = originX;
    this.lastY = originY;
    this.elapsedMs = 0;
  }

  private collectNearbyBlockers(
    originX: number,
    originY: number,
    radius: number,
  ): void {
    this.nearbyBlockers.length = 0;
    const minX = originX - radius;
    const minY = originY - radius;
    const maxX = originX + radius;
    const maxY = originY + radius;

    for (const blocker of this.blockers) {
      if (
        blocker.x <= maxX &&
        blocker.x + blocker.width >= minX &&
        blocker.y <= maxY &&
        blocker.y + blocker.height >= minY
      ) {
        this.nearbyBlockers.push(blocker);
      }
    }
  }

  private addCornerRays(
    originX: number,
    originY: number,
    cornerX: number,
    cornerY: number,
  ): void {
    if (
      Phaser.Math.Distance.Squared(originX, originY, cornerX, cornerY) >
      VISION_CONFIG.radius ** 2
    ) {
      return;
    }

    const angle = Phaser.Math.Angle.Normalize(
      Math.atan2(cornerY - originY, cornerX - originX),
    );
    const epsilon = VISION_CONFIG.cornerRayEpsilon;
    this.rayAngles.push(
      Phaser.Math.Angle.Normalize(angle - epsilon),
      angle,
      Phaser.Math.Angle.Normalize(angle + epsilon),
    );
  }

  private castRay(
    originX: number,
    originY: number,
    directionX: number,
    directionY: number,
    maximumDistance: number,
    blockers: readonly VisionBlocker[],
  ): number {
    let nearestDistance = maximumDistance;

    for (const blocker of blockers) {
      const intersection = rayRectangleIntersection(
        originX,
        originY,
        directionX,
        directionY,
        blocker,
      );

      if (intersection && intersection.near < nearestDistance) {
        nearestDistance = intersection.near;
      }
    }

    return nearestDistance;
  }

  private drawVisibleBlockers(
    graphics: Phaser.GameObjects.Graphics,
    originX: number,
    originY: number,
    color: number,
    alpha: number,
  ): void {
    const cellSize = VISION_CONFIG.blockerCellSize;
    const radiusSquared = VISION_CONFIG.radius ** 2;
    graphics.fillStyle(color, alpha);

    for (const blocker of this.nearbyBlockers) {
      const right = blocker.x + blocker.width;
      const bottom = blocker.y + blocker.height;

      for (let y = blocker.y; y < bottom; y += cellSize) {
        const height = Math.min(cellSize, bottom - y);

        for (let x = blocker.x; x < right; x += cellSize) {
          const width = Math.min(cellSize, right - x);
          const sampleX = x + width / 2;
          const sampleY = y + height / 2;

          if (
            Phaser.Math.Distance.Squared(
              originX,
              originY,
              sampleX,
              sampleY,
            ) > radiusSquared ||
            !this.isFirstVisibleBlocker(blocker, sampleX, sampleY)
          ) {
            continue;
          }

          graphics.fillRect(x, y, width, height);
        }
      }
    }
  }

  private drawVisibilityMask(originX: number, originY: number): void {
    const graphics = this.maskGraphics;
    const cellSize = VISION_CONFIG.blockerCellSize;
    const radiusSquared = VISION_CONFIG.radius ** 2;
    graphics.clear();

    if (this.rayAngles.length < 3) {
      return;
    }

    graphics.fillStyle(0xffffff, 1);
    graphics.beginPath();
    graphics.moveTo(this.hitPoints[0].x, this.hitPoints[0].y);
    for (let index = 1; index < this.rayAngles.length; index += 1) {
      graphics.lineTo(this.hitPoints[index].x, this.hitPoints[index].y);
    }
    graphics.closePath();

    for (const blocker of this.nearbyBlockers) {
      const right = blocker.x + blocker.width;
      const bottom = blocker.y + blocker.height;

      for (let y = blocker.y; y < bottom; y += cellSize) {
        const height = Math.min(cellSize, bottom - y);

        for (let x = blocker.x; x < right; x += cellSize) {
          const width = Math.min(cellSize, right - x);
          const sampleX = x + width / 2;
          const sampleY = y + height / 2;

          if (
            Phaser.Math.Distance.Squared(
              originX,
              originY,
              sampleX,
              sampleY,
            ) > radiusSquared ||
            !this.isFirstVisibleBlocker(blocker, sampleX, sampleY)
          ) {
            continue;
          }

          graphics.moveTo(x, y);
          graphics.lineTo(x + width, y);
          graphics.lineTo(x + width, y + height);
          graphics.lineTo(x, y + height);
          graphics.closePath();
        }
      }
    }

    graphics.fillPath();
  }

  private isFirstVisibleBlocker(
    blocker: VisionBlocker,
    targetX: number,
    targetY: number,
  ): boolean {
    const offsetX = targetX - this.origin.x;
    const offsetY = targetY - this.origin.y;
    const targetDistance = Math.hypot(offsetX, offsetY);

    if (targetDistance <= 0.001) {
      return true;
    }

    const directionX = offsetX / targetDistance;
    const directionY = offsetY / targetDistance;
    let nearestDistance = targetDistance;
    let nearestBlocker: VisionBlocker | null = null;

    for (const candidate of this.nearbyBlockers) {
      const intersection = rayRectangleIntersection(
        this.origin.x,
        this.origin.y,
        directionX,
        directionY,
        candidate,
      );

      if (intersection && intersection.near < nearestDistance) {
        nearestDistance = intersection.near;
        nearestBlocker = candidate;
      }
    }

    return nearestBlocker === blocker;
  }

  private ensurePointCapacity(count: number): void {
    while (this.hitPoints.length < count) {
      this.hitPoints.push(new Phaser.Math.Vector2());
    }
  }

  private drawVisibilityPolygon(
    graphics: Phaser.GameObjects.Graphics,
    color: number,
    alpha: number,
  ): void {
    graphics.clear();

    if (this.rayAngles.length < 3) {
      return;
    }

    graphics.fillStyle(color, alpha);
    graphics.beginPath();
    graphics.moveTo(this.hitPoints[0].x, this.hitPoints[0].y);
    for (let index = 1; index < this.rayAngles.length; index += 1) {
      graphics.lineTo(this.hitPoints[index].x, this.hitPoints[index].y);
    }
    graphics.closePath();
    graphics.fillPath();
  }
}

export function hasLineOfSightBetween(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  blockers: readonly VisionBlocker[],
  wallTolerance = 4,
): boolean {
  const offsetX = targetX - originX;
  const offsetY = targetY - originY;
  const distance = Math.hypot(offsetX, offsetY);

  if (distance <= 0.001) {
    return true;
  }

  const directionX = offsetX / distance;
  const directionY = offsetY / distance;
  const minimumX = Math.min(originX, targetX);
  const minimumY = Math.min(originY, targetY);
  const maximumX = Math.max(originX, targetX);
  const maximumY = Math.max(originY, targetY);

  for (const blocker of blockers) {
    if (
      blocker.x > maximumX ||
      blocker.x + blocker.width < minimumX ||
      blocker.y > maximumY ||
      blocker.y + blocker.height < minimumY
    ) {
      continue;
    }

    const intersection = rayRectangleIntersection(
      originX,
      originY,
      directionX,
      directionY,
      blocker,
    );

    if (intersection && intersection.near < distance - wallTolerance) {
      return false;
    }
  }

  return true;
}

function rayRectangleIntersection(
  originX: number,
  originY: number,
  directionX: number,
  directionY: number,
  blocker: VisionBlocker,
): { readonly near: number; readonly far: number } | null {
  let near = Number.NEGATIVE_INFINITY;
  let far = Number.POSITIVE_INFINITY;

  const xInterval = axisIntersection(
    originX,
    directionX,
    blocker.x,
    blocker.x + blocker.width,
  );
  if (!xInterval) {
    return null;
  }
  near = Math.max(near, xInterval[0]);
  far = Math.min(far, xInterval[1]);

  const yInterval = axisIntersection(
    originY,
    directionY,
    blocker.y,
    blocker.y + blocker.height,
  );
  if (!yInterval) {
    return null;
  }
  near = Math.max(near, yInterval[0]);
  far = Math.min(far, yInterval[1]);

  if (far < 0 || near > far) {
    return null;
  }

  return {
    near: Math.max(0, near),
    far: Math.max(0, far),
  };
}

function axisIntersection(
  origin: number,
  direction: number,
  minimum: number,
  maximum: number,
): readonly [number, number] | null {
  if (Math.abs(direction) < 0.000001) {
    return origin >= minimum && origin <= maximum
      ? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY]
      : null;
  }

  const first = (minimum - origin) / direction;
  const second = (maximum - origin) / direction;
  return first <= second ? [first, second] : [second, first];
}
