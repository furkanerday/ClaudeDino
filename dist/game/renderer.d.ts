import { type GameWorld, GameState } from "./types.js";
export type FrameBuffer = string[][];
export declare function createBuffer(width: number): FrameBuffer;
interface RenderOptions {
    world: GameWorld;
    width: number;
    gameState: GameState;
    countdownValue: number;
}
export declare function renderFrame(options: RenderOptions): string;
export {};
//# sourceMappingURL=renderer.d.ts.map