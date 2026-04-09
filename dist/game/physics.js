import { DinoPose, DINO_X, GRAVITY, GROUND_ROW, JUMP_VELOCITY, ObstacleType, } from "./types.js";
import { DINO_SPRITES, OBSTACLE_SPRITES } from "./sprites.js";
function spriteWidth(sprite) {
    let max = 0;
    for (const row of sprite) {
        if (row.length > max) {
            max = row.length;
        }
    }
    return max;
}
// Pre-computed sprite dimensions (constant, never change)
const DINO_RUN_WIDTH = spriteWidth(DINO_SPRITES[DinoPose.Run1]);
const DINO_RUN_HEIGHT = DINO_SPRITES[DinoPose.Run1].length;
const DINO_CROUCH_WIDTH = spriteWidth(DINO_SPRITES[DinoPose.Crouch]);
const DINO_CROUCH_HEIGHT = DINO_SPRITES[DinoPose.Crouch].length;
const DEFAULT_DINO_Y = GROUND_ROW - DINO_RUN_HEIGHT;
const OBSTACLE_WIDTHS = new Map();
const OBSTACLE_HEIGHTS = new Map();
for (const type of Object.values(ObstacleType)) {
    const sprite = OBSTACLE_SPRITES[type];
    OBSTACLE_WIDTHS.set(type, spriteWidth(sprite));
    OBSTACLE_HEIGHTS.set(type, sprite.length);
}
export function getDefaultDinoY() {
    return DEFAULT_DINO_Y;
}
export function startJump(dino) {
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
export function startCrouch(dino) {
    if (dino.isJumping) {
        return dino;
    }
    return {
        ...dino,
        pose: DinoPose.Crouch,
        isCrouching: true,
        y: GROUND_ROW - DINO_CROUCH_HEIGHT,
    };
}
export function stopCrouch(dino) {
    return {
        ...dino,
        isCrouching: false,
        pose: DinoPose.Run1,
        y: getDefaultDinoY(),
    };
}
export function applyGravity(dino) {
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
function buildHitBox(rect) {
    return {
        left: rect.x + 1,
        right: rect.x + rect.width - 1,
        top: rect.y + 1,
        bottom: rect.y + rect.height - 1,
    };
}
function getDinoHitBox(dino) {
    const width = dino.isCrouching ? DINO_CROUCH_WIDTH : DINO_RUN_WIDTH;
    const height = dino.isCrouching ? DINO_CROUCH_HEIGHT : DINO_RUN_HEIGHT;
    return buildHitBox({ x: DINO_X, y: dino.y, width, height });
}
export function getObstacleY(type) {
    switch (type) {
        case ObstacleType.BirdHigh: {
            return 2;
        }
        case ObstacleType.BirdMid: {
            return 3;
        }
        case ObstacleType.SmallCactus:
        case ObstacleType.LargeCactus:
        case ObstacleType.CactusGroup: {
            return GROUND_ROW - (OBSTACLE_HEIGHTS.get(type) ?? 0);
        }
        default: {
            return type;
        }
    }
}
function getObstacleHitBox(obstacle) {
    const width = OBSTACLE_WIDTHS.get(obstacle.type) ?? 0;
    const height = OBSTACLE_HEIGHTS.get(obstacle.type) ?? 0;
    const obstacleY = getObstacleY(obstacle.type);
    return buildHitBox({ x: obstacle.position.x, y: obstacleY, width, height });
}
export function checkCollision(dino, obstacle) {
    const dinoBox = getDinoHitBox(dino);
    const obstacleBox = getObstacleHitBox(obstacle);
    return (dinoBox.left < obstacleBox.right &&
        dinoBox.right > obstacleBox.left &&
        dinoBox.top < obstacleBox.bottom &&
        dinoBox.bottom > obstacleBox.top);
}
//# sourceMappingURL=physics.js.map