import React, { useEffect, useRef, useState } from "react";
import { Box, Text, useInput, useStdout } from "ink";

import {
  type GameWorld,
  BASE_SPEED,
  COUNTDOWN_SECONDS,
  ClaudeState,
  DinoPose,
  GameState,
  SCORE_INCREMENT_TICKS,
  TICK_INTERVAL_MS,
} from "./types.js";
import {
  applyGravity,
  checkCollision,
  getDefaultDinoY,
  startCrouch,
  startJump,
  stopCrouch,
} from "./physics.js";
import { getCurrentSpeed, moveObstacles, shouldSpawnObstacle, spawnObstacle } from "./obstacles.js";
import { renderFrame } from "./renderer.js";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DinoGameProps {
  claudeState: ClaudeState;
}

// ---------------------------------------------------------------------------
// Input ref
// ---------------------------------------------------------------------------

interface InputState {
  jump: boolean;
  crouchHeld: boolean;
}

// ---------------------------------------------------------------------------
// Initial world factory
// ---------------------------------------------------------------------------

function createInitialWorld(highScore: number): GameWorld {
  return {
    dino: {
      pose: DinoPose.Run1,
      y: getDefaultDinoY(),
      velocityY: 0,
      isCrouching: false,
      isJumping: false,
    },
    obstacles: [],
    clouds: [],
    score: 0,
    highScore,
    speed: BASE_SPEED,
    groundOffset: 0,
    tickCount: 0,
    distanceSinceLastObstacle: 0,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function DinoGame({ claudeState }: DinoGameProps): React.ReactNode {
  const { stdout } = useStdout();
  const columns = stdout.columns;
  const [gameState, setGameState] = useState<GameState>(GameState.Hidden);
  const [world, setWorld] = useState<GameWorld>(() => createInitialWorld(0));
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);

  const worldRef = useRef<GameWorld>(world);
  const gameStateRef = useRef<GameState>(gameState);
  const inputRef = useRef<InputState>({ jump: false, crouchHeld: false });

  // Keep refs in sync
  worldRef.current = world;
  gameStateRef.current = gameState;

  // ---------------------------------------------------------------------------
  // Claude state effect
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const current = gameStateRef.current;

    if (
      claudeState === ClaudeState.Working &&
      (current === GameState.Hidden ||
        current === GameState.Paused ||
        current === GameState.GameOver)
    ) {
      if (current === GameState.GameOver) {
        const previousHighScore = worldRef.current.highScore;
        setWorld(createInitialWorld(previousHighScore));
      }

      setCountdown(COUNTDOWN_SECONDS);
      setGameState(GameState.Countdown);
    }

    if (
      claudeState === ClaudeState.Idle &&
      (current === GameState.Playing || current === GameState.Countdown)
    ) {
      setGameState(GameState.Paused);
    }
  }, [claudeState]);

  // ---------------------------------------------------------------------------
  // Countdown effect
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (gameState !== GameState.Countdown) {
      return (): void => {
        /* no-op */
      };
    }

    const interval = setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          setGameState(GameState.Playing);
          return COUNTDOWN_SECONDS;
        }

        return previous - 1;
      });
    }, 1000);

    return (): void => {
      clearInterval(interval);
    };
  }, [gameState]);

  // ---------------------------------------------------------------------------
  // Game loop effect
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (gameState !== GameState.Playing) {
      return (): void => {
        /* no-op */
      };
    }

    const interval = setInterval(() => {
      setWorld((previous) => {
        // 1. Read input
        const input = inputRef.current;
        const wantJump = input.jump;
        const wantCrouch = input.crouchHeld;

        // Reset input for next tick
        input.jump = false;
        input.crouchHeld = false;

        // 2. Apply jump/crouch
        let dino = previous.dino;
        if (wantJump) {
          dino = startJump(dino);
        }

        if (wantCrouch && !dino.isJumping) {
          dino = startCrouch(dino);
        } else if (!wantCrouch && dino.isCrouching) {
          dino = stopCrouch(dino);
        }

        // 3. Apply gravity
        dino = applyGravity(dino);

        // 4. Move obstacles
        const speed = getCurrentSpeed(previous.score);
        let obstacles = moveObstacles(previous.obstacles, speed);

        // 5. Spawn obstacles
        let distanceSinceLastObstacle = previous.distanceSinceLastObstacle + speed;
        const spawnCheckWorld: GameWorld = {
          ...previous,
          distanceSinceLastObstacle,
        };

        if (shouldSpawnObstacle(spawnCheckWorld, columns)) {
          obstacles = [...obstacles, spawnObstacle(previous, columns)];
          distanceSinceLastObstacle = 0;
        }

        // 6. Check collisions
        for (const obstacle of obstacles) {
          if (checkCollision(dino, obstacle)) {
            const finalScore = previous.score;
            const updatedHighScore = Math.max(finalScore, previous.highScore);
            setGameState(GameState.GameOver);

            return {
              ...previous,
              dino,
              obstacles,
              score: finalScore,
              highScore: updatedHighScore,
              speed,
              distanceSinceLastObstacle,
            };
          }
        }

        // 7. Move/spawn clouds
        let clouds = previous.clouds
          .map((cloud) => ({
            ...cloud,
            x: cloud.x - speed * 0.5,
          }))
          .filter((cloud) => cloud.x >= -20);

        if (Math.random() < 0.005) {
          clouds = [
            ...clouds,
            {
              x: columns + 2,
              y: Math.floor(Math.random() * 3),
            },
          ];
        }

        // 8. Increment score
        const tickCount = previous.tickCount + 1;
        const score = tickCount % SCORE_INCREMENT_TICKS === 0 ? previous.score + 1 : previous.score;

        // 9. Update ground offset
        const groundOffset = (previous.groundOffset + speed) % columns;

        return {
          dino,
          obstacles,
          clouds,
          score,
          highScore: Math.max(score, previous.highScore),
          speed,
          groundOffset,
          tickCount,
          distanceSinceLastObstacle,
        };
      });
    }, TICK_INTERVAL_MS);

    return (): void => {
      clearInterval(interval);
    };
  }, [gameState, columns]);

  // ---------------------------------------------------------------------------
  // Input handling
  // ---------------------------------------------------------------------------

  useInput(
    (input, key) => {
      if (input === " " || key.upArrow) {
        inputRef.current.jump = true;
      }

      if (key.downArrow) {
        inputRef.current.crouchHeld = true;
      }
    },
    { isActive: gameState === GameState.Playing },
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const frame = renderFrame({
    world,
    width: columns,
    gameState,
    countdownValue: countdown,
  });

  return (
    <Box flexDirection="column">
      <Text>{frame}</Text>
    </Box>
  );
}

export default DinoGame;
