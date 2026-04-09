import { BIRD_ANIMATION_TICKS, DinoPose, ObstacleType, RUN_ANIMATION_TICKS } from "./types.js";

export type Sprite = readonly string[];

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
  [DinoPose.Run1]: DINO_RUN1,
  [DinoPose.Run2]: DINO_RUN2,
  [DinoPose.Jump]: DINO_JUMP,
  [DinoPose.Crouch]: DINO_CROUCH,
} as const;

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
  [ObstacleType.SmallCactus]: SMALL_CACTUS,
  [ObstacleType.LargeCactus]: LARGE_CACTUS,
  [ObstacleType.CactusGroup]: CACTUS_GROUP,
  [ObstacleType.BirdHigh]: BIRD_WINGS_UP,
  [ObstacleType.BirdMid]: BIRD_WINGS_UP,
} as const;

export const CLOUD: Sprite = [" \u2591\u2591", "\u2591\u2591\u2591\u2591"] as const;

export function getBirdSprite(tickCount: number): Sprite {
  const frame = Math.floor(tickCount / BIRD_ANIMATION_TICKS) % 2;
  return frame === 0 ? BIRD_WINGS_UP : BIRD_WINGS_DOWN;
}

export function getDinoRunSprite(tickCount: number): DinoPose {
  const frame = Math.floor(tickCount / RUN_ANIMATION_TICKS) % 2;
  return frame === 0 ? DinoPose.Run1 : DinoPose.Run2;
}
