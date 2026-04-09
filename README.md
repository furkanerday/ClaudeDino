# ClaudeDino

A tiny dino runner game that takes over the dead space in Claude Code's terminal while the AI is processing. Jump over cacti, dodge birds, rack up points. It pauses when Claude is done and waits for you to send another task before it lets you play again. Turns waiting time into game time and keeps your eyes where the work is happening.

## Why This Exists

Every time Claude starts working on a task, you wait. And waiting is when your brain starts looking for something else to do. You check your phone. You open YouTube. You scroll X. You switch to a browser tab and forget you were even coding. Five minutes later Claude is done and you have no idea because you are watching a video about why socks disappear in the dryer.

ClaudeDino fixes this by giving you something to do right there in your terminal. A simple, dumb, addictive little dino game that only runs while Claude is working. The moment Claude finishes, the game pauses. The only way to keep playing is to give Claude another task. So instead of losing focus, you stay on the screen, you stay in the flow, and you actually notice when Claude is done.

It is not productivity software. It is an anti-distraction trick disguised as a game.

## How It Works

ClaudeDino runs in a separate terminal pane right below Claude Code. When you type `claudedino`, it automatically splits your terminal and starts the game in the bottom half. No manual setup needed.

Behind the scenes, it uses Claude Code's **hooks system** to know when Claude is working and when Claude is idle. When Claude starts processing your task, the game starts with a 3-2-1 countdown. When Claude finishes, the game pauses instantly. Your score and position are saved so you pick up exactly where you left off next time.

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
│  Score: 00042                                    HI: 00891  │
│           ░░                                                │
│                              ██                             │
│   ██                        ████         ██                 │
│  ████         █             ████         ██                 │
│  █ █         ██             ████                            │
│  ████       ████            ████                            │
│ ═══════════████═════════════════════════════════════════════ │
└─────────────────────────────────────────────────────────────┘
```

## Installation

```bash
npm install -g claudedino
```

## Usage

Just run it in your terminal while Claude Code is open:

```bash
claudedino
```

That is it. The app will:

1. Detect your terminal (iTerm2, Windows Terminal, tmux, etc.)
2. Automatically split the pane and launch the game in the bottom half
3. Configure Claude Code hooks so the game knows when Claude is working
4. Start playing the moment Claude gets a task

If auto-split does not work on your setup, you can split manually and run:

```bash
claudedino --attach
```

## Controls

| Key                   | Action             |
| --------------------- | ------------------ |
| `Space` or `Up Arrow` | Jump over cacti    |
| `Down Arrow`          | Crouch under birds |

Controls only work while the game is active (Claude is working). When Claude is idle, the game is paused and your keyboard works normally.

## Game Rules

- You are a dino running through an endless desert
- Jump over cacti, duck under birds
- Speed increases as your score goes up
- Birds start appearing after score 200
- When Claude finishes a task, the game pauses with your score saved
- When Claude starts the next task, the game resumes after a 3-2-1 countdown
- If you hit an obstacle, game over. Score resets next round.
- High score is tracked for the session

## Platform Support

| OS      | Terminal         | Auto-Split               |
| ------- | ---------------- | ------------------------ |
| macOS   | iTerm2           | Yes                      |
| macOS   | Terminal.app     | Yes                      |
| Windows | Windows Terminal | Yes                      |
| Linux   | tmux             | Yes                      |
| Any     | Manual split     | Fallback with `--attach` |

## How the State Detection Works

ClaudeDino hooks into Claude Code's event system by adding hooks to your `~/.claude/settings.json`. These hooks write a tiny state flag whenever Claude starts or finishes processing. The game watches this flag and reacts instantly.

## License

MIT
