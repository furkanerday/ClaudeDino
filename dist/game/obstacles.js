import { BASE_SPEED, DIFFICULTY_TABLE, MIN_OBSTACLE_GAP, ObstacleType, SPAWN_X_OFFSET, } from "./types.js";
function getCurrentTier(score) {
    for (const tier of DIFFICULTY_TABLE) {
        if (score <= tier.maxScore) {
            return tier;
        }
    }
    // Fallback to last tier (unreachable since last tier has Infinity maxScore)
    const lastTier = DIFFICULTY_TABLE.at(-1);
    if (lastTier === undefined) {
        throw new Error("DIFFICULTY_TABLE is empty");
    }
    return lastTier;
}
export function getCurrentSpeed(score) {
    const tier = getCurrentTier(score);
    return BASE_SPEED * tier.speedMultiplier;
}
function getAvailableObstacleTypes(score) {
    const tier = getCurrentTier(score);
    const types = [ObstacleType.SmallCactus];
    if (score >= 100) {
        types.push(ObstacleType.LargeCactus, ObstacleType.CactusGroup);
    }
    if (tier.birdsEnabled) {
        types.push(ObstacleType.BirdHigh, ObstacleType.BirdMid);
    }
    return types;
}
export function shouldSpawnObstacle(world, terminalWidth) {
    const tier = getCurrentTier(world.score);
    const speed = BASE_SPEED * tier.speedMultiplier;
    const minGap = Math.max(MIN_OBSTACLE_GAP, Math.round(40 / speed));
    const spawnThreshold = minGap + Math.round((Math.random() * 15) / tier.spawnRateMultiplier);
    return world.distanceSinceLastObstacle > spawnThreshold && terminalWidth > 0;
}
export function spawnObstacle(world, terminalWidth) {
    const types = getAvailableObstacleTypes(world.score);
    const randomIndex = Math.floor(Math.random() * types.length);
    const type = types[randomIndex] ?? ObstacleType.SmallCactus;
    return {
        type,
        position: {
            x: terminalWidth + SPAWN_X_OFFSET,
            y: 0,
        },
    };
}
export function moveObstacles(obstacles, speed) {
    return obstacles
        .map((obstacle) => ({
        ...obstacle,
        position: {
            ...obstacle.position,
            x: obstacle.position.x - speed,
        },
    }))
        .filter((obstacle) => obstacle.position.x >= -10);
}
//# sourceMappingURL=obstacles.js.map