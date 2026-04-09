import { type DinoState, type Obstacle, ObstacleType } from "./types.js";
export declare function getDefaultDinoY(): number;
export declare function startJump(dino: DinoState): DinoState;
export declare function startCrouch(dino: DinoState): DinoState;
export declare function stopCrouch(dino: DinoState): DinoState;
export declare function applyGravity(dino: DinoState): DinoState;
export declare function getObstacleY(type: ObstacleType): number;
export declare function checkCollision(dino: DinoState, obstacle: Obstacle): boolean;
//# sourceMappingURL=physics.d.ts.map