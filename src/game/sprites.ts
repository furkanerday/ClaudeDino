import {
  type DinoPose,
  type ObstacleType,
  BIRD_ANIMATION_TICKS,
  RUN_ANIMATION_TICKS,
} from "./types.js";

// ---------------------------------------------------------------------------
// Sprite type
// ---------------------------------------------------------------------------

export type Sprite = readonly string[];

// ---------------------------------------------------------------------------
// Dino sprites
// ---------------------------------------------------------------------------

const DINO_RUN1: Sprite = [
  " \u2588\u2588\u2588\u2588",
  "\u2588\u2588\u2584\u2588\u2588",
  "\u2588\u2588\u2588\u2588\u2588",
  "\u2588\u2588\u2588",
  "\u2588\u2588\u2588\u2588",
  "\u2588 \u2588",
] as const;

const DINO_RUN2: Sprite = [
  " \u2588\u2588\u2588\u2588",
  "\u2588\u2588\u2584\u2588\u2588",
  "\u2588\u2588\u2588\u2588\u2588",
  "\u2588\u2588\u2588",
  "\u2588\u2588\u2588\u2588",
  " \u2588 \u2588",
] as const;

const DINO_JUMP: Sprite = [
  " \u2588\u2588\u2588\u2588",
  "\u2588\u2588\u2584\u2588\u2588",
  "\u2588\u2588\u2588\u2588\u2588",
  "\u2588\u2588\u2588",
  "\u2588\u2588\u2588\u2588",
  "\u2588  \u2588",
] as const;

const DINO_CROUCH: Sprite = [
  " \u2588\u2588\u2588\u2588\u2588",
  "\u2588\u2588\u2584\u2588\u2588\u2588\u2588",
  "\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
] as const;

export const DINO_SPRITES: Record<DinoPose, Sprite> = {
  run1: DINO_RUN1,
  run2: DINO_RUN2,
  jump: DINO_JUMP,
  crouch: DINO_CROUCH,
} as const;

// ---------------------------------------------------------------------------
// Obstacle sprites
// ---------------------------------------------------------------------------

const SMALL_CACTUS: Sprite = [" \u2588", "\u2588\u2588", "\u2588\u2588"] as const;

const LARGE_CACTUS: Sprite = [
  " \u2588",
  "\u2588\u2588",
  "\u2588\u2588",
  "\u2588\u2588",
  "\u2588\u2588",
] as const;

const CACTUS_GROUP: Sprite = [
  " \u2588  \u2588",
  "\u2588\u2588 \u2588\u2588",
  "\u2588\u2588 \u2588\u2588",
  "\u2588\u2588\u2588\u2588\u2588",
] as const;

const BIRD_WINGS_UP: Sprite = ["\u2580 \u2580", "\u2588\u2588\u2588\u2588"] as const;

const BIRD_WINGS_DOWN: Sprite = ["\u2588\u2588\u2588\u2588", "\u2584 \u2584"] as const;

export const OBSTACLE_SPRITES: Record<ObstacleType, Sprite> = {
  smallCactus: SMALL_CACTUS,
  largeCactus: LARGE_CACTUS,
  cactusGroup: CACTUS_GROUP,
  birdHigh: BIRD_WINGS_UP,
  birdMid: BIRD_WINGS_UP,
} as const;

// ---------------------------------------------------------------------------
// Cloud sprite
// ---------------------------------------------------------------------------

export const CLOUD: Sprite = [" \u2591\u2591", "\u2591\u2591\u2591\u2591"] as const;

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

export function getBirdSprite(tickCount: number): Sprite {
  const frame = Math.floor(tickCount / BIRD_ANIMATION_TICKS) % 2;
  return frame === 0 ? BIRD_WINGS_UP : BIRD_WINGS_DOWN;
}

export function getDinoRunSprite(tickCount: number): DinoPose {
  const frame = Math.floor(tickCount / RUN_ANIMATION_TICKS) % 2;
  return frame === 0 ? ("run1" as DinoPose) : ("run2" as DinoPose);
}
