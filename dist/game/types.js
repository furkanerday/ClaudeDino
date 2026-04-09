// Enums
export var GameState;
(function (GameState) {
    GameState["Hidden"] = "hidden";
    GameState["Countdown"] = "countdown";
    GameState["Playing"] = "playing";
    GameState["Paused"] = "paused";
    GameState["GameOver"] = "gameOver";
})(GameState || (GameState = {}));
export var ClaudeState;
(function (ClaudeState) {
    ClaudeState["Working"] = "working";
    ClaudeState["Idle"] = "idle";
})(ClaudeState || (ClaudeState = {}));
export var ObstacleType;
(function (ObstacleType) {
    ObstacleType["SmallCactus"] = "smallCactus";
    ObstacleType["LargeCactus"] = "largeCactus";
    ObstacleType["CactusGroup"] = "cactusGroup";
    ObstacleType["BirdHigh"] = "birdHigh";
    ObstacleType["BirdMid"] = "birdMid";
})(ObstacleType || (ObstacleType = {}));
export var DinoPose;
(function (DinoPose) {
    DinoPose["Run1"] = "run1";
    DinoPose["Run2"] = "run2";
    DinoPose["Jump"] = "jump";
    DinoPose["Crouch"] = "crouch";
})(DinoPose || (DinoPose = {}));
export const GAME_HEIGHT = 8;
export const DINO_X = 5;
export const GROUND_ROW = 7;
export const SCORE_ROW = 0;
export const BASE_SPEED = 1.2;
export const GRAVITY = 0.6;
export const JUMP_VELOCITY = -3.2;
export const TICK_INTERVAL_MS = 16;
export const SCORE_INCREMENT_TICKS = 6;
export const COUNTDOWN_SECONDS = 3;
export const RUN_ANIMATION_TICKS = 8;
export const BIRD_ANIMATION_TICKS = 12;
export const MIN_OBSTACLE_GAP = 20;
export const DIFFICULTY_TABLE = [
    { maxScore: 99, speedMultiplier: 1, birdsEnabled: false, spawnRateMultiplier: 1 },
    { maxScore: 199, speedMultiplier: 1.15, birdsEnabled: false, spawnRateMultiplier: 1 },
    { maxScore: 399, speedMultiplier: 1.3, birdsEnabled: true, spawnRateMultiplier: 1 },
    { maxScore: 699, speedMultiplier: 1.5, birdsEnabled: true, spawnRateMultiplier: 1.3 },
    { maxScore: Infinity, speedMultiplier: 1.7, birdsEnabled: true, spawnRateMultiplier: 1.6 },
];
export const MAX_CLOUDS = 15;
export const CLOUD_SPAWN_PROBABILITY = 0.005;
export const CLOUD_SPEED_FACTOR = 0.5;
export const CLOUD_CULL_X = -20;
export const CLOUD_MAX_Y = 3;
export const SPAWN_X_OFFSET = 2;
//# sourceMappingURL=types.js.map