// Enums

export enum GameState {
  Hidden = "hidden",
  Countdown = "countdown",
  Playing = "playing",
  Paused = "paused",
  GameOver = "gameOver",
}

export enum ClaudeState {
  Working = "working",
  Idle = "idle",
}

export enum ObstacleType {
  SmallCactus = "smallCactus",
  LargeCactus = "largeCactus",
  CactusGroup = "cactusGroup",
  BirdHigh = "birdHigh",
  BirdMid = "birdMid",
}

export enum DinoPose {
  Run1 = "run1",
  Run2 = "run2",
  Jump = "jump",
  Crouch = "crouch",
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

interface DifficultyTier {
  readonly maxScore: number;
  readonly speedMultiplier: number;
  readonly birdsEnabled: boolean;
  readonly spawnRateMultiplier: number;
}

export const DIFFICULTY_TABLE: readonly DifficultyTier[] = [
  { maxScore: 99, speedMultiplier: 1, birdsEnabled: false, spawnRateMultiplier: 1 },
  { maxScore: 199, speedMultiplier: 1.15, birdsEnabled: false, spawnRateMultiplier: 1 },
  { maxScore: 399, speedMultiplier: 1.3, birdsEnabled: true, spawnRateMultiplier: 1 },
  { maxScore: 699, speedMultiplier: 1.5, birdsEnabled: true, spawnRateMultiplier: 1.3 },
  { maxScore: Infinity, speedMultiplier: 1.7, birdsEnabled: true, spawnRateMultiplier: 1.6 },
] as const;

export const MAX_CLOUDS = 15;
export const CLOUD_SPAWN_PROBABILITY = 0.005;
export const CLOUD_SPEED_FACTOR = 0.5;
export const CLOUD_CULL_X = -20;
export const CLOUD_MAX_Y = 3;
export const SPAWN_X_OFFSET = 2;
