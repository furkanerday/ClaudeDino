export declare enum GameState {
    Hidden = "hidden",
    Countdown = "countdown",
    Playing = "playing",
    Paused = "paused",
    GameOver = "gameOver"
}
export declare enum ClaudeState {
    Working = "working",
    Idle = "idle"
}
export declare enum ObstacleType {
    SmallCactus = "smallCactus",
    LargeCactus = "largeCactus",
    CactusGroup = "cactusGroup",
    BirdHigh = "birdHigh",
    BirdMid = "birdMid"
}
export declare enum DinoPose {
    Run1 = "run1",
    Run2 = "run2",
    Jump = "jump",
    Crouch = "crouch"
}
export interface Position {
    x: number;
    y: number;
}
export interface Obstacle {
    type: ObstacleType;
    position: Position;
}
export interface DinoState {
    pose: DinoPose;
    y: number;
    velocityY: number;
    isCrouching: boolean;
    isJumping: boolean;
}
export interface GameWorld {
    dino: DinoState;
    obstacles: Obstacle[];
    clouds: Position[];
    score: number;
    highScore: number;
    speed: number;
    groundOffset: number;
    tickCount: number;
    distanceSinceLastObstacle: number;
}
export declare const GAME_HEIGHT = 8;
export declare const DINO_X = 5;
export declare const GROUND_ROW = 7;
export declare const SCORE_ROW = 0;
export declare const BASE_SPEED = 1.2;
export declare const GRAVITY = 0.6;
export declare const JUMP_VELOCITY = -3.2;
export declare const TICK_INTERVAL_MS = 16;
export declare const SCORE_INCREMENT_TICKS = 6;
export declare const COUNTDOWN_SECONDS = 3;
export declare const RUN_ANIMATION_TICKS = 8;
export declare const BIRD_ANIMATION_TICKS = 12;
export declare const MIN_OBSTACLE_GAP = 20;
interface DifficultyTier {
    readonly maxScore: number;
    readonly speedMultiplier: number;
    readonly birdsEnabled: boolean;
    readonly spawnRateMultiplier: number;
}
export declare const DIFFICULTY_TABLE: readonly DifficultyTier[];
export declare const MAX_CLOUDS = 15;
export declare const CLOUD_SPAWN_PROBABILITY = 0.005;
export declare const CLOUD_SPEED_FACTOR = 0.5;
export declare const CLOUD_CULL_X = -20;
export declare const CLOUD_MAX_Y = 3;
export declare const SPAWN_X_OFFSET = 2;
export {};
//# sourceMappingURL=types.d.ts.map