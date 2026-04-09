# ClaudeDino Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone ASCII dino runner game that runs alongside Claude Code in a split terminal pane, controlled by Claude Code's hooks system.

**Architecture:** Standalone Node.js CLI app built with Ink (React for terminals). Uses Claude Code hooks to detect working/idle state via a temp file. Auto-splits the user's terminal on launch. Published to npm as a global CLI.

**Tech Stack:** TypeScript, Ink 5, React 18, Node.js 22+

---

## File Map

| File                     | Responsibility                                                                 |
| ------------------------ | ------------------------------------------------------------------------------ |
| `src/cli.ts`             | Entry point, arg parsing, orchestrates auto-split or game mode                 |
| `src/app.tsx`            | Root Ink component, mounts game, connects state watcher                        |
| `src/game/types.ts`      | All TypeScript types, enums, constants                                         |
| `src/game/sprites.ts`    | Sprite definitions as 2D string arrays                                         |
| `src/game/physics.ts`    | Jump, gravity, crouch, collision detection                                     |
| `src/game/obstacles.ts`  | Obstacle spawning, movement, difficulty progression                            |
| `src/game/renderer.ts`   | Frame buffer creation, sprite drawing, string output                           |
| `src/game/dino-game.tsx` | Main Ink component, game loop, state machine, input                            |
| `src/hooks/setup.ts`     | Read/write ~/.claude/settings.json for hook config                             |
| `src/platform/detect.ts` | Detect OS and terminal emulator                                                |
| `src/platform/split.ts`  | Platform-specific terminal split (iTerm, Terminal.app, Windows Terminal, tmux) |
| `src/state/watcher.ts`   | Watch temp state file, emit working/idle events                                |

---

### Task 1: Project Setup and Dependencies

**Files:**

- Modify: `package.json`
- Modify: `tsconfig.json`
- Create: `src/game/types.ts`

- [ ] **Step 1: Install Ink and React dependencies**

```bash
npm install ink react ink-use-stdout-dimensions
npm install --save-dev @types/react
```

- [ ] **Step 2: Update package.json with bin entry**

Add to `package.json`:

```json
{
  "bin": {
    "claudedino": "dist/cli.js"
  }
}
```

- [ ] **Step 3: Update tsconfig.json for JSX and emit**

Remove `"noEmit": true` and `"allowImportingTsExtensions": true`. Add `"jsx": "react-jsx"` and `"jsxImportSource": "react"`.

- [ ] **Step 4: Create types.ts with all game types and constants**

```typescript
// src/game/types.ts

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

export const DIFFICULTY_TABLE: readonly {
  readonly maxScore: number;
  readonly speedMultiplier: number;
  readonly birdsEnabled: boolean;
  readonly spawnRateMultiplier: number;
}[] = [
  { maxScore: 99, speedMultiplier: 1.0, birdsEnabled: false, spawnRateMultiplier: 1.0 },
  { maxScore: 199, speedMultiplier: 1.15, birdsEnabled: false, spawnRateMultiplier: 1.0 },
  { maxScore: 399, speedMultiplier: 1.3, birdsEnabled: true, spawnRateMultiplier: 1.0 },
  { maxScore: 699, speedMultiplier: 1.5, birdsEnabled: true, spawnRateMultiplier: 1.3 },
  { maxScore: Infinity, speedMultiplier: 1.7, birdsEnabled: true, spawnRateMultiplier: 1.6 },
] as const;

export const MIN_OBSTACLE_GAP = 20;
```

- [ ] **Step 5: Run check:all to verify**

```bash
npm run check:all
```

Expected: All 5 checks pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add ink dependencies and game types"
```

---

### Task 2: Sprites

**Files:**

- Create: `src/game/sprites.ts`

- [ ] **Step 1: Create sprite definitions**

Define all sprites (dino run1, run2, jump, crouch, small cactus, large cactus, cactus group, bird up, bird down, cloud) as `readonly string[]` arrays using Unicode block characters. Export `DINO_SPRITES` as `Record<DinoPose, Sprite>`, `OBSTACLE_SPRITES` as `Record<ObstacleType, Sprite>`, and helper functions `getBirdSprite(tickCount)` and `getDinoRunSprite(tickCount)` for animation frame selection.

Sprite characters to use: `\u2588` (full block), `\u2584` (lower half), `\u2580` (upper half), `\u2591` (light shade for clouds), `\u2550` (double horizontal for ground).

- [ ] **Step 2: Run check:all**

```bash
npm run check:all
```

- [ ] **Step 3: Commit**

```bash
git add src/game/sprites.ts
git commit -m "feat: add sprite definitions for dino, obstacles, and clouds"
```

---

### Task 3: Physics Engine

**Files:**

- Create: `src/game/physics.ts`

- [ ] **Step 1: Implement physics functions**

Functions to implement:

- `startJump(dino: DinoState): DinoState` -- returns new dino with jump velocity applied. No-op if already jumping or crouching.
- `startCrouch(dino: DinoState): DinoState` -- returns new dino with crouch pose. No-op if jumping.
- `stopCrouch(dino: DinoState): DinoState` -- returns new dino with crouch cleared.
- `applyGravity(dino: DinoState): DinoState` -- applies gravity to velocity, updates Y. If dino lands (Y >= ground Y), stops jumping.
- `getDefaultDinoY(): number` -- calculates ground-level Y for standing dino based on sprite height and GROUND_ROW.
- `checkCollision(dino: DinoState, obstacle: Obstacle): boolean` -- AABB collision with 1-character padding on all hitboxes for forgiving collisions. Bird obstacles use fixed Y positions (row 2 for BirdHigh, row 3 for BirdMid). Ground obstacles sit on ground row.

- [ ] **Step 2: Run check:all**

```bash
npm run check:all
```

- [ ] **Step 3: Commit**

```bash
git add src/game/physics.ts
git commit -m "feat: add physics engine with jump, gravity, and collision detection"
```

---

### Task 4: Obstacle Spawning and Movement

**Files:**

- Create: `src/game/obstacles.ts`

- [ ] **Step 1: Implement obstacle system**

Functions to implement:

- `getCurrentSpeed(score: number): number` -- looks up DIFFICULTY_TABLE by score, returns BASE_SPEED \* speedMultiplier.
- `shouldSpawnObstacle(world: GameWorld, terminalWidth: number): boolean` -- checks if distanceSinceLastObstacle exceeds minimum gap (scaled by speed and spawn rate).
- `spawnObstacle(world: GameWorld, terminalWidth: number): Obstacle` -- picks random obstacle type from available types for current score bracket. Creates obstacle at x = terminalWidth + 2.
- `moveObstacles(obstacles: Obstacle[], speed: number): Obstacle[]` -- moves all obstacles left by speed, filters out those past x = -10.

Available obstacle types by score: 0-99 SmallCactus only, 100-199 add LargeCactus + CactusGroup, 200+ add BirdHigh + BirdMid.

- [ ] **Step 2: Run check:all**

```bash
npm run check:all
```

- [ ] **Step 3: Commit**

```bash
git add src/game/obstacles.ts
git commit -m "feat: add obstacle spawning with difficulty progression"
```

---

### Task 5: Frame Buffer Renderer

**Files:**

- Create: `src/game/renderer.ts`

- [ ] **Step 1: Implement the frame buffer renderer**

Core types and functions:

- `FrameBuffer = string[][]` -- 2D array of single characters, GAME_HEIGHT rows by terminal width columns.
- `createBuffer(width: number): FrameBuffer` -- creates buffer filled with spaces.
- `drawSprite(buffer, sprite, x, y): void` -- stamps a sprite into the buffer at position, skipping space characters and out-of-bounds coordinates.
- `drawGround(buffer, width, offset): void` -- draws ground line at GROUND_ROW using `\u2550` characters.
- `drawClouds(buffer, clouds): void` -- draws cloud sprites at their positions.
- `drawObstacles(buffer, obstacles, tickCount): void` -- draws obstacle sprites, using animated bird sprite based on tick count. Birds at fixed Y rows (2 or 3), ground obstacles at GROUND_ROW - sprite height.
- `drawDino(buffer, world): void` -- draws dino sprite at DINO_X, world.dino.y. Selects animated run pose if not jumping/crouching.
- `drawScore(buffer, width, score, highScore): void` -- writes score at row 0 left, high score at row 0 right. Zero-padded 5 digits.
- `drawOverlay(buffer, width, text): void` -- writes centered text at middle row of buffer.
- `renderFrame(world, width, gameState, countdownValue): string` -- orchestrates all drawing, returns newline-joined string. For Hidden state, returns "Waiting for Claude..." centered. For Countdown/Paused/GameOver, draws overlay text on top of game.

- [ ] **Step 2: Run check:all**

```bash
npm run check:all
```

- [ ] **Step 3: Commit**

```bash
git add src/game/renderer.ts
git commit -m "feat: add frame buffer renderer with sprite drawing and overlays"
```

---

### Task 6: State File Watcher

**Files:**

- Create: `src/state/watcher.ts`

- [ ] **Step 1: Implement file watcher**

Functions to implement:

- `getStatePath(): string` -- returns `path.join(os.tmpdir(), "claudedino-state")`.
- `initStateFile(): void` -- writes "idle\n" to state file. Catches errors silently (temp dir may be restricted).
- `watchState(callback: StateChangeCallback): () => void` -- reads initial state, calls callback. Sets up `fs.watch()` on state file. On each change, reads file, compares to last known state, calls callback only if changed. Returns cleanup function that closes the watcher.

Type: `StateChangeCallback = (state: ClaudeState) => void`.

- [ ] **Step 2: Run check:all**

```bash
npm run check:all
```

- [ ] **Step 3: Commit**

```bash
git add src/state/watcher.ts
git commit -m "feat: add state file watcher for Claude Code hook communication"
```

---

### Task 7: Hook Configuration Setup

**Files:**

- Create: `src/hooks/setup.ts`

- [ ] **Step 1: Implement hook setup**

Functions to implement:

- `setupHooks(): void` -- reads `~/.claude/settings.json`, merges ClaudeDino hooks (PreToolUse writes "working", PostToolUse writes "idle", Notification with idle_prompt matcher writes "idle"). Preserves existing user hooks. Tags each hook command with `# claudedino` suffix so they can be identified later. Creates the file/directory if missing.
- `removeHooks(): void` -- reads settings, filters out any hooks containing `# claudedino` tag, writes back.

Hook format must match Claude Code's schema:

```json
{
  "matcher": "",
  "hooks": [{ "type": "command", "command": "echo working > /path/to/state # claudedino" }]
}
```

Use `os.tmpdir()` to resolve state file path in hook commands. Use `os.homedir()` to resolve `~/.claude/settings.json`.

Read/write settings.json with `fs.readFileSync`/`fs.writeFileSync`. Parse with `JSON.parse`, serialize with `JSON.stringify(settings, null, 2)`.

- [ ] **Step 2: Run check:all**

```bash
npm run check:all
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/setup.ts
git commit -m "feat: add Claude Code hook configuration setup"
```

---

### Task 8: Platform Detection and Terminal Splitting

**Files:**

- Create: `src/platform/detect.ts`
- Create: `src/platform/split.ts`

- [ ] **Step 1: Implement platform detection**

`detectPlatform(): Platform` -- returns MacOS/Windows/Linux based on `process.platform`.
`detectTerminal(): Terminal` -- checks env vars: `$TMUX` for tmux, `$TERM_PROGRAM` for iTerm.app/Apple_Terminal, `$WT_SESSION` for Windows Terminal. Falls back to Unknown.

- [ ] **Step 2: Implement terminal splitting**

`trySplit(terminal: Terminal): boolean` -- executes platform-specific split command, returns true on success, false on failure.

Split implementations use `execFileSync` (not `execSync`) to avoid shell injection:

- **iTerm2**: `execFileSync("osascript", ["-e", appleScript])` where appleScript tells iTerm to split horizontally and run `claudedino --attach`.
- **Terminal.app**: `execFileSync("osascript", ["-e", appleScript])` where appleScript tells Terminal to do script in front window.
- **tmux**: `execFileSync("tmux", ["split-window", "-v", "-l", "10", "claudedino --attach"])`.
- **Windows Terminal**: `execFileSync("wt", ["-w", "0", "sp", "-V", "--size", "0.3", "cmd", "/c", "claudedino --attach"])`.

All wrapped in try/catch returning false on failure.

- [ ] **Step 3: Run check:all**

```bash
npm run check:all
```

- [ ] **Step 4: Commit**

```bash
git add src/platform/detect.ts src/platform/split.ts
git commit -m "feat: add platform detection and cross-platform terminal splitting"
```

---

### Task 9: Main Game Component

**Files:**

- Create: `src/game/dino-game.tsx`

- [ ] **Step 1: Implement the main game Ink component**

This is the central component. It contains:

**State:** `gameState` (GameState enum), `world` (GameWorld), `countdown` (number), refs for world/gameState/input.

**Claude state effect:** When `claudeState` prop changes to Working, transition Hidden/Paused/GameOver to Countdown (reset world on GameOver, preserve highScore). When Idle, transition Playing/Countdown to Paused.

**Countdown effect:** When gameState is Countdown, run 1-second interval decrementing countdown. At 0, transition to Playing.

**Game loop effect:** When gameState is Playing, run TICK_INTERVAL_MS interval that: reads input ref, applies jump/crouch, applies gravity, moves obstacles, spawns obstacles, checks collisions (transition to GameOver on hit), moves clouds, spawns clouds randomly, increments score every SCORE_INCREMENT_TICKS, updates speed from difficulty table.

**Input handling:** `useInput` hook active only during Playing state. Space/UpArrow sets input.jump, DownArrow sets input.crouchHeld. Note: Ink has no keyup event. Reset crouchHeld to false each tick and only set true when down arrow is detected.

**Render:** Calls `renderFrame(world, columns, gameState, countdown)` and wraps in `<Box><Text>{frame}</Text></Box>`.

Uses `useStdoutDimensions` from ink-use-stdout-dimensions for terminal width.

- [ ] **Step 2: Run check:all**

```bash
npm run check:all
```

- [ ] **Step 3: Commit**

```bash
git add src/game/dino-game.tsx
git commit -m "feat: add main dino game component with state machine and game loop"
```

---

### Task 10: Root App Component

**Files:**

- Create: `src/app.tsx`

- [ ] **Step 1: Implement root app**

Simple component that:

1. Holds `claudeState` in useState, defaults to ClaudeState.Idle
2. On mount (useEffect), calls `initStateFile()` then `watchState(setClaudeState)`. Returns cleanup function.
3. Renders `<DinoGame claudeState={claudeState} />`

- [ ] **Step 2: Run check:all**

```bash
npm run check:all
```

- [ ] **Step 3: Commit**

```bash
git add src/app.tsx
git commit -m "feat: add root app component connecting state watcher to game"
```

---

### Task 11: CLI Entry Point

**Files:**

- Create: `src/cli.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Implement CLI entry point**

`src/cli.ts` with `#!/usr/bin/env node` shebang at top.

Logic:

1. Parse `process.argv` for `--attach` flag.
2. If not attach mode: call `setupHooks()`, detect terminal, call `trySplit()`. If split succeeded, `process.exit(0)`. If failed, print fallback message and continue.
3. Call `render(React.createElement(App))` from ink to start the Ink app.

- [ ] **Step 2: Update src/index.ts to export the app**

Replace placeholder content with exports of App and DinoGame components.

- [ ] **Step 3: Run check:all**

```bash
npm run check:all
```

- [ ] **Step 4: Commit**

```bash
git add src/cli.ts src/index.ts
git commit -m "feat: add CLI entry point with auto-split and hook setup"
```

---

### Task 12: Build, Test End-to-End, and Fix Issues

**Files:**

- All files

- [ ] **Step 1: Build the project**

```bash
npm run build
```

Fix any TypeScript errors.

- [ ] **Step 2: Test the game renders**

```bash
node dist/cli.js --attach
```

Verify "Waiting for Claude..." appears.

- [ ] **Step 3: Test state detection**

In a second terminal:

```bash
echo working > $TMPDIR/claudedino-state
```

Verify 3-2-1 countdown starts, then game plays.

```bash
echo idle > $TMPDIR/claudedino-state
```

Verify game pauses.

- [ ] **Step 4: Test input**

While Playing, press Space (jump) and Down arrow (crouch). Verify dino responds.

- [ ] **Step 5: Run check:all**

```bash
npm run check:all
```

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build and runtime issues from end-to-end testing"
```

---

### Task 13: Final Polish and Push

**Files:**

- All changed files

- [ ] **Step 1: Run /simplify on all changed code**

Use the `/simplify` skill on each source file.

- [ ] **Step 2: Run check:all one final time**

```bash
npm run check:all
```

- [ ] **Step 3: Commit and push**

```bash
git add -A
git commit -m "chore: final polish and cleanup"
git push origin main
```

- [ ] **Step 4: Test npm pack**

```bash
npm pack
```

Verify the tarball includes all necessary files.
