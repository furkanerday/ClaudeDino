import { DinoPose, ObstacleType } from "./types.js";
export type Sprite = readonly string[];
export declare const DINO_SPRITES: Record<DinoPose, Sprite>;
export declare const OBSTACLE_SPRITES: Record<ObstacleType, Sprite>;
export declare const CLOUD: Sprite;
export declare function getBirdSprite(tickCount: number): Sprite;
export declare function getDinoRunSprite(tickCount: number): DinoPose;
//# sourceMappingURL=sprites.d.ts.map