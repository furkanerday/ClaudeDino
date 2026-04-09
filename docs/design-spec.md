# ClaudeDino — Design Spec

**Date:** 2026-04-09
**Status:** Draft
**Author:** Furkan
**Purpose:** One-time GitHub showcase project — an ASCII dino runner game that runs alongside Claude Code in a split terminal pane while Claude is working.

---

## 1. Problem Statement

When Claude Code is processing a task, the user waits with nothing to do. The input bar is disabled — dead UI. Users lose attention, switch tabs, and disengage.

**ClaudeDino** repurposes this dead time with a playable game that:

- Keeps users engaged inside Claude Code
- Encourages users to keep submitting tasks (to keep playing)
- Showcases a creative Claude Code companion tool on GitHub

---

## 2. High-Level Architecture

### 2.1 Approach: Standalone Ink App + Claude Code Hooks

Claude Code's source is closed (compiled binary), so a fork is not possible. Instead, ClaudeDino is a **standalone Node.js terminal app** built with Ink (React for terminals) that runs in a **separate terminal pane** below Claude Code.

State detection uses Claude Code's **hooks system** -- shell commands configured in `~/.claude/settings.json` that fire on events like tool use. Hooks write a state flag to a temp file, and the game watches that file for changes.

On launch, the app **auto-splits the terminal** using platform-specific scripting (AppleScript on macOS, PowerShell on Windows, tmux commands on Linux) so the user only needs to type one command.

### 2.2 System Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Claude Code (normal, unmodified)                           │
│                                                             │
│  > Working on your task...                                  │
│  ■ Running tests                                            │
│                                                             │
│  > type bar                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ClaudeDino (separate Ink app in split pane)                │
│  8 rows, full terminal width                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Communication Flow

```
Claude Code ──(hook fires)──► writes to $TMPDIR/claudedino-state
                                        │
ClaudeDino ──(fs.watch)────────────────►reads state file
                                        │
                                  "working" or "idle"
                                        │
                                  Game starts / pauses
```

### 2.4 Distribution

Published to npm as a global CLI tool:

```bash
npm install -g claudedino
claudedino
```

The `claudedino` command:

1. Detects OS and terminal emulator
2. Auto-splits the pane and launches the game in the bottom half
3. Configures Claude Code hooks in `~/.claude/settings.json` (first run only)
4. Starts watching for state changes

---

## 3. Game States

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
HIDDEN ──(Claude starts)──► COUNTDOWN ──(0)──► PLAYING ──┤
                                ▲                  │      │
                                │                  │      │
                         (Claude starts)      (collision) │
                                │                  │      │
                            PAUSED ◄──(Claude done)┘      │
                                                          │
                            GAME_OVER ◄───────────────────┘
                                │
                         (Claude starts)
                                │
                                ▼
                            COUNTDOWN (score resets)
```

### 3.1 State Definitions

| State         | Game Area Visible | Input Captured    | Description                                                                        |
| ------------- | ----------------- | ----------------- | ---------------------------------------------------------------------------------- |
| **HIDDEN**    | Waiting screen    | No                | Claude is idle. Shows "Waiting for Claude..." message in the game pane.            |
| **COUNTDOWN** | Yes               | No                | Shows "3...2...1" centered in game area. Lasts 3 seconds.                          |
| **PLAYING**   | Yes               | Yes (space, ↑, ↓) | Active gameplay. Obstacles scroll, dino runs.                                      |
| **PAUSED**    | Yes               | No                | Claude finished. Game frozen. "PAUSED" overlay. Score and all positions preserved. |
| **GAME_OVER** | Yes               | No                | Collision occurred. "GAME OVER — Score: X" shown. Frozen.                          |

### 3.2 State Transitions

| From      | To        | Trigger                                            |
| --------- | --------- | -------------------------------------------------- |
| HIDDEN    | COUNTDOWN | Claude begins processing a task                    |
| COUNTDOWN | PLAYING   | 3-second countdown reaches 0                       |
| PLAYING   | PAUSED    | Claude finishes processing (becomes idle)          |
| PLAYING   | GAME_OVER | Dino collides with obstacle                        |
| PAUSED    | COUNTDOWN | Claude begins processing again                     |
| GAME_OVER | COUNTDOWN | Claude begins processing again (score resets to 0) |

### 3.3 Edge Cases

- **Claude finishes during COUNTDOWN:** Transition to PAUSED. When Claude starts again, restart the countdown from 3.
- **Very short Claude tasks (< 3 seconds):** Countdown may not finish before Claude is done. Game goes COUNTDOWN → PAUSED. This is fine — the game only plays when there's enough processing time.
- **Multiple rapid task submissions:** Each start triggers COUNTDOWN → PLAYING. If Claude finishes and starts again quickly, PLAYING → PAUSED → COUNTDOWN → PLAYING.

---

## 4. Gameplay Mechanics

### 4.1 Core Loop

- Side-scrolling endless runner, left to right
- Dino character fixed at ~column 5 (left side)
- Obstacles spawn off-screen right, scroll leftward
- Ground line spans full width
- Speed starts at a base value and increases linearly with score

### 4.2 Controls

| Key              | Action      | When               |
| ---------------- | ----------- | ------------------ |
| `Space`          | Jump        | PLAYING state only |
| `↑` (Arrow Up)   | Jump        | PLAYING state only |
| `↓` (Arrow Down) | Crouch/duck | PLAYING state only |

- Jump: dino rises for ~0.3s, hangs briefly, falls for ~0.3s
- Crouch: dino switches to low-profile sprite, hitbox shrinks vertically, widens slightly horizontally
- Crouch is held — release ↓ to stand back up
- Cannot jump while crouching (must release crouch first)

### 4.3 Obstacles

**Ground obstacles (must jump):**

| Variant      | Width  | Height | Description            |
| ------------ | ------ | ------ | ---------------------- |
| Small cactus | 2 cols | 3 rows | Single short cactus    |
| Large cactus | 2 cols | 5 rows | Single tall cactus     |
| Cactus group | 5 cols | 4 rows | Two cacti side by side |

**Air obstacles (must crouch):**

| Variant     | Width  | Height | Altitude | Description                   |
| ----------- | ------ | ------ | -------- | ----------------------------- |
| Bird (high) | 4 cols | 2 rows | Row 2-3  | Flapping bird, must crouch    |
| Bird (mid)  | 4 cols | 2 rows | Row 3-4  | Can jump over or crouch under |

### 4.4 Obstacle Spawning

- Minimum gap between obstacles: scales inversely with speed (always survivable)
- Obstacle type: random weighted selection — more cacti early, birds introduced after score 200
- No two consecutive "impossible" patterns — spawner validates that each obstacle is avoidable given current speed

### 4.5 Scoring

- Score increments by 1 every 6 game ticks (~10 points/sec at base speed, matching Chrome dino pacing)
- Displayed as zero-padded 5 digits: `00000` to `99999`
- High score tracked per session (resets on Claude Code restart)
- High score displayed alongside current score: `Score: 00142  HI: 00891`
- Score flashes briefly every 100 points (visual feedback)

### 4.6 Difficulty Progression

| Score Range | Speed Multiplier | Obstacles Available    |
| ----------- | ---------------- | ---------------------- |
| 0-99        | 1.0x             | Small cactus only      |
| 100-199     | 1.15x            | Small + large cactus   |
| 200-399     | 1.3x             | All cacti + birds      |
| 400-699     | 1.5x             | All, higher spawn rate |
| 700+        | 1.7x (capped)    | All, max spawn rate    |

---

## 5. Visual Design

### 5.1 Game Area Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Row 1:  Score: 00142                                        HI: 00891  │
│ Row 2:  (sky — clouds drift right to left)                             │
│ Row 3:  (play area — birds fly here)                                   │
│ Row 4:  (play area — dino head, tall cacti tops)                       │
│ Row 5:  (play area — dino body, cacti, birds)                          │
│ Row 6:  (play area — dino legs, small cacti)                           │
│ Row 7:  (play area — dino feet, ground obstacles base)                 │
│ Row 8:  ═══════════════════(ground line)════════════════════════════════│
└─────────────────────────────────────────────────────────────────────────┘
```

Total height: **8 rows** (1 score + 6 play area + 1 ground), full terminal width of the game pane.

### 5.2 Rendering Approach

- ASCII/Unicode block characters: `█ ▄ ▀ ░ ▓ ═ ▌ ▐`
- Each character cell = 1 pixel
- All sprites designed on a character grid
- No color — monochrome (white on terminal background) to match Claude Code's aesthetic
- Ground line: `═` repeated across full width

### 5.3 Sprite Definitions

**Dino — Running Frame 1:**

```
 ████
██▄██
█████
███
████
█ █
```

**Dino — Running Frame 2:**

```
 ████
██▄██
█████
███
████
 █ █
```

**Dino — Jumping:**

```
 ████
██▄██
█████
███
████
█  █
```

**Dino — Crouching:**

```
 █████
██▄████
███████
```

**Small Cactus:**

```
 █
██
██
```

**Large Cactus:**

```
 █
██
██
██
██
```

**Cactus Group:**

```
 █  █
██ ██
██ ██
█████
```

**Bird — Wings Up:**

```
▀ ▀
████
```

**Bird — Wings Down:**

```
████
▄ ▄
```

**Cloud:**

```
 ░░
░░░░
```

Note: These are reference sprites. Final pixel art will be refined during implementation to ensure readability at terminal scale.

### 5.4 Animations

| Element       | Animation                                      | Frame Rate          |
| ------------- | ---------------------------------------------- | ------------------- |
| Dino running  | Alternates between Frame 1 and Frame 2         | Every 8 game ticks  |
| Bird flapping | Alternates wings up / wings down               | Every 12 game ticks |
| Clouds        | Drift leftward at 0.5x obstacle speed          | Continuous          |
| Score flash   | Score text inverts (dark on light) for 8 ticks | Every 100 points    |
| Ground        | Dashed pattern scrolls left to add motion feel | Continuous          |

### 5.5 Overlay States

**Countdown:**

```
═══════════════════════ 3 ═══════════════════════
```

Number centered in game area, changes each second. Game area is visible but frozen (shows last state or empty field if first run).

**Paused:**

```
                    ║ PAUSED ║
```

Centered overlay on frozen game. All positions preserved.

**Game Over:**

```
               GAME OVER  Score: 00142
```

Centered overlay on frozen game.

---

## 6. State Detection

### 6.1 Claude Code Hooks

Claude Code supports hooks in `~/.claude/settings.json` that fire shell commands on specific events. ClaudeDino configures these hooks on first launch:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "command": "echo working > $TMPDIR/claudedino-state"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "",
        "command": "echo idle > $TMPDIR/claudedino-state"
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "command": "echo idle > $TMPDIR/claudedino-state"
      }
    ]
  }
}
```

- `PreToolUse` fires when Claude begins executing a tool (working)
- `PostToolUse` fires when Claude finishes a tool execution (idle)
- `Notification` fires on status changes including task completion (idle)

### 6.2 State File Watching

The state file path is resolved at runtime using `os.tmpdir()` (works on macOS, Windows, Linux):

```typescript
import os from "node:os";
import path from "node:path";

const STATE_FILE = path.join(os.tmpdir(), "claudedino-state");
```

The game uses `fs.watch()` on the state file to detect changes:

```typescript
fs.watch(STATE_FILE, () => {
  const state = fs.readFileSync(STATE_FILE, "utf-8").trim();
  // state is "working" or "idle"
});
```

- Near-instant detection (file system events, not polling)
- Typical latency: under 50ms from hook fire to game reaction
- If the state file does not exist, the game stays in HIDDEN state
- The game creates the file on startup if missing
- Hook commands also use the OS temp directory for cross-platform support

---

## 7. Keyboard Input Handling

### 7.1 Input Capture

- Game runs in its own terminal pane, so it has its own stdin
- Ink's `useInput` hook captures all keyboard input in the game pane
- Game captures `space`, `↑`, `↓` during PLAYING state
- No conflict with Claude Code since they run in separate panes

### 7.2 Focus Behavior

- The game pane does not need focus to display, but needs focus to receive input
- User clicks into the game pane to play, clicks back to Claude Code pane to type
- When Claude finishes (game pauses), user naturally clicks back to Claude Code to send the next message
- When Claude starts working again, user clicks into the game pane to play

---

## 8. Game Loop Architecture

### 8.1 Tick-Based Loop

```
GAME TICK (~60 fps via setInterval at 16ms)
  │
  ├─ Read input buffer (jump pressed? crouch held?)
  ├─ Update dino position (apply gravity, jump velocity, crouch state)
  ├─ Move obstacles leftward by current speed
  ├─ Move clouds leftward at 0.5x speed
  ├─ Scroll ground pattern
  ├─ Check collisions (dino hitbox vs obstacle hitboxes)
  ├─ Spawn new obstacles if needed (based on distance since last spawn)
  ├─ Remove off-screen obstacles (scrolled past left edge)
  ├─ Increment score
  ├─ Update speed based on score bracket
  └─ Render frame to character buffer → output to terminal
```

### 8.2 Collision Detection

- Axis-Aligned Bounding Box (AABB) on character grid
- Each sprite has a hitbox slightly smaller than its visual bounds (forgiving collisions)
- Dino hitbox changes between standing and crouching poses

### 8.3 Rendering Pipeline

1. Clear frame buffer (2D array of characters, width x 8 rows)
2. Draw ground line (row 7)
3. Draw clouds (row 2)
4. Draw obstacles at their current positions
5. Draw dino at fixed column, current vertical position
6. Draw score text (row 1)
7. Draw overlay text if PAUSED / GAME_OVER / COUNTDOWN
8. Flush buffer to terminal using Ink's text rendering

---

## 9. File Structure

Standalone npm package:

```
src/
  cli.ts                    # Entry point, arg parsing, auto-split orchestration
  app.tsx                   # Root Ink component, state machine, mounts game
  game/
    dino-game.tsx           # Main game Ink component, game loop, rendering
    sprites.ts              # All sprite definitions as 2D character arrays
    physics.ts              # Jump/gravity/collision math
    obstacles.ts            # Obstacle spawning, types, movement
    renderer.ts             # Frame buffer to character string conversion
    types.ts                # TypeScript interfaces and constants
  hooks/
    setup.ts                # Reads/writes ~/.claude/settings.json to configure hooks
  platform/
    detect.ts               # Detects OS and terminal emulator
    split-iterm.ts          # macOS iTerm2 auto-split via AppleScript
    split-terminal-app.ts   # macOS Terminal.app auto-split via AppleScript
    split-windows.ts        # Windows Terminal auto-split via PowerShell
    split-tmux.ts           # Linux/tmux auto-split via tmux commands
  state/
    watcher.ts              # fs.watch on $TMPDIR/claudedino-state, emits events
```

14 files total. Published as a global CLI via npm `bin` field.

---

## 10. Integration Points

### 10.1 Hook Configuration

On first run, ClaudeDino reads `~/.claude/settings.json`, merges its hooks into the existing config (preserving any user-defined hooks), and writes back. If the file does not exist, it creates it with only the ClaudeDino hooks.

Hooks are tagged with a comment-like identifier so ClaudeDino can find and update/remove them later:

```json
{
  "matcher": "",
  "command": "echo working > $TMPDIR/claudedino-state # claudedino"
}
```

### 10.2 Auto-Split Terminal

The CLI entry point (`src/cli.ts`) handles:

1. Parse args (`--attach` skips auto-split)
2. Detect platform and terminal via environment variables (`$TERM_PROGRAM`, `$TMUX`, OS detection)
3. If not `--attach`: execute platform-specific split, launch `claudedino --attach` in the new pane, exit the original process
4. If `--attach`: run the Ink app directly (game mode)

### 10.3 Dependencies

- **ink** — React for terminals (rendering)
- **ink-use-stdout-dimensions** — terminal width/height detection
- **Node.js built-ins** — `fs`, `child_process`, `path`, `os`
- Game loop: `setInterval` (Node.js native)
- Input handling: Ink's `useInput` hook

---

## 11. Scope Boundaries

### In Scope

- Dino runner game with jump and crouch
- Ground obstacles (3 cactus variants) and air obstacles (birds)
- Score and session high score
- 5 game states with proper transitions
- 3-2-1 countdown on resume
- ASCII block art sprites and animations
- Monochrome rendering

### Out of Scope

- Sound effects
- Color/themes
- Persistent high scores across sessions
- Multiplayer or leaderboards
- Customizable controls
- Day/night cycle (Chrome dino has this — skipping it)
- Pterodactyl variants beyond basic bird
- Settings or configuration
- Update mechanism
