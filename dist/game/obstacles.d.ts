import { type GameWorld, type Obstacle } from "./types.js";
export declare function getCurrentSpeed(score: number): number;
export declare function shouldSpawnObstacle(world: GameWorld, terminalWidth: number): boolean;
export declare function spawnObstacle(world: GameWorld, terminalWidth: number): Obstacle;
export declare function moveObstacles(obstacles: Obstacle[], speed: number): Obstacle[];
//# sourceMappingURL=obstacles.d.ts.map