import {
  type DinoState,
  type Obstacle,
  DinoPose,
  DINO_X,
  GRAVITY,
  GROUND_ROW,
  JUMP_VELOCITY,
  ObstacleType,
} from "./types.js";
import { DINO_SPRITES, OBSTACLE_SPRITES } from "./sprites.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface HitBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function spriteWidth(sprite: readonly string[]): number {
  return Math.max(...sprite.map((row) => row.length));
}

function spriteHeight(sprite: readonly string[]): number {
  return sprite.length;
}

// ---------------------------------------------------------------------------
// Default dino Y
// ---------------------------------------------------------------------------

export function getDefaultDinoY(): number {
  return GROUND_ROW - spriteHeight(DINO_SPRITES[DinoPose.Run1]);
}

// ---------------------------------------------------------------------------
// Jump
// ---------------------------------------------------------------------------

export function startJump(dino: DinoState): DinoState {
  if (dino.isJumping || dino.isCrouching) {
    return dino;
  }

  return {
    ...dino,
    pose: DinoPose.Jump,
    velocityY: JUMP_VELOCITY,
    isJumping: true,
  };
}

// ---------------------------------------------------------------------------
// Crouch
// ---------------------------------------------------------------------------

export function startCrouch(dino: DinoState): DinoState {
  if (dino.isJumping) {
    return dino;
  }

  return {
    ...dino,
    pose: DinoPose.Crouch,
    isCrouching: true,
    y: GROUND_ROW - spriteHeight(DINO_SPRITES[DinoPose.Crouch]),
  };
}

export function stopCrouch(dino: DinoState): DinoState {
  return {
    ...dino,
    isCrouching: false,
    pose: DinoPose.Run1,
    y: getDefaultDinoY(),
  };
}

// ---------------------------------------------------------------------------
// Gravity
// ---------------------------------------------------------------------------

export function applyGravity(dino: DinoState): DinoState {
  if (!dino.isJumping) {
    return dino;
  }

  const updatedVelocityY = dino.velocityY + GRAVITY;
  const updatedY = dino.y + updatedVelocityY;
  const groundY = getDefaultDinoY();

  if (updatedY >= groundY) {
    return {
      ...dino,
      y: groundY,
      velocityY: 0,
      isJumping: false,
      pose: DinoPose.Run1,
    };
  }

  return {
    ...dino,
    y: updatedY,
    velocityY: updatedVelocityY,
  };
}

// ---------------------------------------------------------------------------
// Collision detection
// ---------------------------------------------------------------------------

function getDinoHitBox(dino: DinoState): HitBox {
  const sprite = dino.isCrouching ? DINO_SPRITES[DinoPose.Crouch] : DINO_SPRITES[DinoPose.Run1];
  const width = spriteWidth(sprite);
  const height = spriteHeight(sprite);

  return {
    left: DINO_X + 1,
    right: DINO_X + width - 1,
    top: dino.y + 1,
    bottom: dino.y + height - 1,
  };
}

function getObstacleY(obstacle: Obstacle): number {
  switch (obstacle.type) {
    case ObstacleType.BirdHigh: {
      return 2;
    }

    case ObstacleType.BirdMid: {
      return 3;
    }

    case ObstacleType.SmallCactus:
    case ObstacleType.LargeCactus:
    case ObstacleType.CactusGroup: {
      return GROUND_ROW - spriteHeight(OBSTACLE_SPRITES[obstacle.type]);
    }

    default: {
      return obstacle.type satisfies never;
    }
  }
}

function getObstacleHitBox(obstacle: Obstacle): HitBox {
  const sprite = OBSTACLE_SPRITES[obstacle.type];
  const width = spriteWidth(sprite);
  const height = spriteHeight(sprite);
  const obstacleY = getObstacleY(obstacle);

  return {
    left: obstacle.position.x + 1,
    right: obstacle.position.x + width - 1,
    top: obstacleY + 1,
    bottom: obstacleY + height - 1,
  };
}

export function checkCollision(dino: DinoState, obstacle: Obstacle): boolean {
  const dinoBox = getDinoHitBox(dino);
  const obstacleBox = getObstacleHitBox(obstacle);

  return (
    dinoBox.left < obstacleBox.right &&
    dinoBox.right > obstacleBox.left &&
    dinoBox.top < obstacleBox.bottom &&
    dinoBox.bottom > obstacleBox.top
  );
}
