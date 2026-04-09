# ClaudeDino

## Project Overview

ASCII dino runner game that runs alongside Claude Code in a split terminal pane. Built with Ink (React for terminals) and TypeScript. Uses Claude Code hooks for state detection.

## Tech Stack

- TypeScript (strict mode, all flags enabled)
- Ink 7 (React for terminals)
- React 19
- Node.js 22+
- ESM modules

## Quick Start

```bash
npm install
npm run build
node dist/cli.js --attach
# In another terminal: echo working > $TMPDIR/claudedino-state
# Game starts. echo idle > $TMPDIR/claudedino-state to pause.
```

## Commands

- `npm run build` -- compile TypeScript to dist/
- `npm run check:all` -- run all 5 checks (typecheck, suppression scan, ESLint, Prettier, tsconfig audit)
- `npm run lint` -- ESLint only
- `npm run lint:fix` -- ESLint with auto-fix
- `npm run format` -- Prettier check
- `npm run format:fix` -- Prettier write
- `npm run typecheck` -- TypeScript type check (no emit)

## Pre-Commit Workflow

1. Run `npm run check:all`
2. Zero warnings, zero errors, zero suppressions

## Linting

ESLint with three strict rulesets stacked:

- `eslint/all` (every built-in rule)
- `typescript-eslint/strictTypeChecked` + `stylisticTypeChecked`
- `unicorn/all`

Key enforced rules:

- `explicit-function-return-type` -- all functions must have return types
- `consistent-type-imports` -- use `import type` for type-only imports
- `naming-convention` -- camelCase default, PascalCase for types/enums/React components, UPPER_CASE for const variables
- `no-console` -- use `process.stdout.write()` instead
- Zero lint suppressions allowed (checked by scripts/check-suppressions.sh)

## Architecture

```
src/
  cli.ts              -- Entry point, arg parsing, auto-split
  app.tsx             -- Root Ink component, connects state watcher to game
  game/
    types.ts          -- All enums, interfaces, constants
    sprites.ts        -- Sprite definitions (2D string arrays)
    physics.ts        -- Jump, gravity, crouch, collision (pure functions)
    obstacles.ts      -- Spawning, movement, difficulty progression
    renderer.ts       -- Frame buffer creation, sprite drawing, text output
    dino-game.tsx     -- Main game component, state machine, game loop
  hooks/
    setup.ts          -- Claude Code hook configuration in ~/.claude/settings.json
  platform/
    detect.ts         -- OS and terminal detection
    split.ts          -- Cross-platform terminal splitting
  state/
    watcher.ts        -- Watches temp state file for working/idle changes
```

## Key Patterns

- All game logic functions are pure (return new objects, no mutation)
- `noUncheckedIndexedAccess` is enabled -- guard all array access with undefined checks
- Use `execFileSync` not `execSync` to avoid shell injection
- React components use function declarations with PascalCase names
- Ink's `useInput` for keyboard, `useStdout` for terminal dimensions

## Gotchas

- `ink-use-stdout-dimensions` is CJS and incompatible with ink v7 (ESM with top-level await). Use `useStdout()` from ink directly.
- State file path is `os.tmpdir() + "/claudedino-state"`. On macOS this is `/var/folders/.../claudedino-state`, not `/tmp/`.
- Hook commands in `~/.claude/settings.json` are tagged with `# claudedino` suffix for identification.
- Ink has no keyup event. Crouch detection works by resetting `crouchHeld` each tick and re-setting it when down arrow fires.
