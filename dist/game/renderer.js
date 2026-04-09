import { GameState, ObstacleType, DINO_X, GAME_HEIGHT, GROUND_ROW, SCORE_ROW, } from "./types.js";
import { CLOUD, DINO_SPRITES, OBSTACLE_SPRITES, getBirdSprite, getDinoRunSprite, } from "./sprites.js";
import { getObstacleY } from "./physics.js";
export function createBuffer(width) {
    const buffer = [];
    for (let row = 0; row < GAME_HEIGHT; row++) {
        const line = [];
        for (let col = 0; col < width; col++) {
            line.push(" ");
        }
        buffer.push(line);
    }
    return buffer;
}
function indexedChars(text) {
    const result = [];
    let index = 0;
    for (const character of text) {
        result.push([index, character]);
        index++;
    }
    return result;
}
function drawSprite(command) {
    const roundedX = Math.round(command.x);
    const roundedY = Math.round(command.y);
    for (const [rowIndex, spriteLine] of command.sprite.entries()) {
        const bufferRow = roundedY + rowIndex;
        if (bufferRow < 0 || bufferRow >= GAME_HEIGHT) {
            continue;
        }
        const targetRow = command.buffer[bufferRow];
        if (targetRow === undefined) {
            continue;
        }
        for (const [colIndex, character] of indexedChars(spriteLine)) {
            if (character === " ") {
                continue;
            }
            const bufferCol = roundedX + colIndex;
            if (bufferCol < 0 || bufferCol >= targetRow.length) {
                continue;
            }
            targetRow[bufferCol] = character;
        }
    }
}
function drawGround(buffer, width, offset) {
    const groundRow = buffer[GROUND_ROW];
    if (groundRow === undefined) {
        return;
    }
    const roundedOffset = Math.round(offset);
    for (let col = 0; col < width; col++) {
        if (col < groundRow.length) {
            const pattern = (col + roundedOffset) % 4;
            groundRow[col] = pattern === 0 ? "\u2500" : "\u2550";
        }
    }
}
function drawClouds(buffer, clouds) {
    for (const cloud of clouds) {
        drawSprite({ buffer, sprite: CLOUD, x: cloud.x, y: cloud.y });
    }
}
function drawObstacles(buffer, obstacles, tickCount) {
    for (const obstacle of obstacles) {
        const isBird = obstacle.type === ObstacleType.BirdHigh || obstacle.type === ObstacleType.BirdMid;
        const sprite = isBird ? getBirdSprite(tickCount) : OBSTACLE_SPRITES[obstacle.type];
        const y = getObstacleY(obstacle.type);
        drawSprite({ buffer, sprite, x: obstacle.position.x, y });
    }
}
function drawDino(buffer, world) {
    const sprite = world.dino.isJumping || world.dino.isCrouching
        ? DINO_SPRITES[world.dino.pose]
        : DINO_SPRITES[getDinoRunSprite(world.tickCount)];
    drawSprite({ buffer, sprite, x: DINO_X, y: world.dino.y });
}
function padScore(score) {
    return String(score).padStart(5, "0");
}
function writeText(row, startCol, text) {
    for (const [index, character] of indexedChars(text)) {
        const col = startCol + index;
        if (col >= 0 && col < row.length) {
            row[col] = character;
        }
    }
}
function drawScore(command) {
    const scoreRow = command.buffer[SCORE_ROW];
    if (scoreRow === undefined) {
        return;
    }
    const scoreText = `Score: ${padScore(command.score)}`;
    const highScoreText = `HI: ${padScore(command.highScore)}`;
    writeText(scoreRow, 2, scoreText);
    writeText(scoreRow, command.width - highScoreText.length - 2, highScoreText);
}
function drawOverlay(buffer, width, text) {
    const middleRow = Math.floor(GAME_HEIGHT / 2);
    const row = buffer[middleRow];
    if (row === undefined) {
        return;
    }
    const startCol = Math.floor((width - text.length) / 2);
    writeText(row, startCol, text);
}
function drawGameScene(buffer, world, width) {
    drawGround(buffer, width, world.groundOffset);
    drawClouds(buffer, world.clouds);
    drawObstacles(buffer, world.obstacles, world.tickCount);
    drawDino(buffer, world);
    drawScore({
        buffer,
        width,
        score: world.score,
        highScore: world.highScore,
    });
}
function bufferToString(buffer) {
    return buffer.map((row) => row.join("")).join("\n");
}
export function renderFrame(options) {
    const buffer = createBuffer(options.width);
    switch (options.gameState) {
        case GameState.Hidden: {
            drawOverlay(buffer, options.width, "Waiting for Claude...");
            return bufferToString(buffer);
        }
        case GameState.Playing: {
            drawGameScene(buffer, options.world, options.width);
            return bufferToString(buffer);
        }
        case GameState.Countdown: {
            drawGameScene(buffer, options.world, options.width);
            drawOverlay(buffer, options.width, String(options.countdownValue));
            return bufferToString(buffer);
        }
        case GameState.Paused: {
            drawGameScene(buffer, options.world, options.width);
            drawOverlay(buffer, options.width, "\u2551 PAUSED \u2551");
            return bufferToString(buffer);
        }
        case GameState.GameOver: {
            drawGameScene(buffer, options.world, options.width);
            drawOverlay(buffer, options.width, `GAME OVER  Score: ${padScore(options.world.score)}`);
            return bufferToString(buffer);
        }
        default: {
            return options.gameState;
        }
    }
}
//# sourceMappingURL=renderer.js.map