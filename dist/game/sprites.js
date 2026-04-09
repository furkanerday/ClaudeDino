import { BIRD_ANIMATION_TICKS, DinoPose, ObstacleType, RUN_ANIMATION_TICKS } from "./types.js";
const DINO_RUN1 = [
    " \u2588\u2588\u2588\u2588",
    "\u2588\u2588\u2584\u2588\u2588",
    "\u2588\u2588\u2588\u2588\u2588",
    "\u2588\u2588\u2588",
    "\u2588\u2588\u2588\u2588",
    "\u2588 \u2588",
];
const DINO_RUN2 = [
    " \u2588\u2588\u2588\u2588",
    "\u2588\u2588\u2584\u2588\u2588",
    "\u2588\u2588\u2588\u2588\u2588",
    "\u2588\u2588\u2588",
    "\u2588\u2588\u2588\u2588",
    " \u2588 \u2588",
];
const DINO_JUMP = [
    " \u2588\u2588\u2588\u2588",
    "\u2588\u2588\u2584\u2588\u2588",
    "\u2588\u2588\u2588\u2588\u2588",
    "\u2588\u2588\u2588",
    "\u2588\u2588\u2588\u2588",
    "\u2588  \u2588",
];
const DINO_CROUCH = [
    " \u2588\u2588\u2588\u2588\u2588",
    "\u2588\u2588\u2584\u2588\u2588\u2588\u2588",
    "\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
];
export const DINO_SPRITES = {
    [DinoPose.Run1]: DINO_RUN1,
    [DinoPose.Run2]: DINO_RUN2,
    [DinoPose.Jump]: DINO_JUMP,
    [DinoPose.Crouch]: DINO_CROUCH,
};
const SMALL_CACTUS = [" \u2588", "\u2588\u2588", "\u2588\u2588"];
const LARGE_CACTUS = [
    " \u2588",
    "\u2588\u2588",
    "\u2588\u2588",
    "\u2588\u2588",
    "\u2588\u2588",
];
const CACTUS_GROUP = [
    " \u2588  \u2588",
    "\u2588\u2588 \u2588\u2588",
    "\u2588\u2588 \u2588\u2588",
    "\u2588\u2588\u2588\u2588\u2588",
];
const BIRD_WINGS_UP = ["\u2580 \u2580", "\u2588\u2588\u2588\u2588"];
const BIRD_WINGS_DOWN = ["\u2588\u2588\u2588\u2588", "\u2584 \u2584"];
export const OBSTACLE_SPRITES = {
    [ObstacleType.SmallCactus]: SMALL_CACTUS,
    [ObstacleType.LargeCactus]: LARGE_CACTUS,
    [ObstacleType.CactusGroup]: CACTUS_GROUP,
    [ObstacleType.BirdHigh]: BIRD_WINGS_UP,
    [ObstacleType.BirdMid]: BIRD_WINGS_UP,
};
export const CLOUD = [" \u2591\u2591", "\u2591\u2591\u2591\u2591"];
export function getBirdSprite(tickCount) {
    const frame = Math.floor(tickCount / BIRD_ANIMATION_TICKS) % 2;
    return frame === 0 ? BIRD_WINGS_UP : BIRD_WINGS_DOWN;
}
export function getDinoRunSprite(tickCount) {
    const frame = Math.floor(tickCount / RUN_ANIMATION_TICKS) % 2;
    return frame === 0 ? DinoPose.Run1 : DinoPose.Run2;
}
//# sourceMappingURL=sprites.js.map