import { execFileSync } from "node:child_process";

import { Terminal } from "./detect.js";

const ITERM2_SCRIPT = [
  'tell application "iTerm2"',
  "  tell current session of current window",
  '    split horizontally with default profile command "claudedino --attach"',
  "  end tell",
  "end tell",
].join("\n");

const TERMINAL_APP_SCRIPT = [
  'tell application "Terminal"',
  '  do script "claudedino --attach" in front window',
  "end tell",
].join("\n");

function splitIterm2(): boolean {
  try {
    execFileSync("osascript", ["-e", ITERM2_SCRIPT]);
    return true;
  } catch {
    return false;
  }
}

function splitTerminalApp(): boolean {
  try {
    execFileSync("osascript", ["-e", TERMINAL_APP_SCRIPT]);
    return true;
  } catch {
    return false;
  }
}

function splitTmux(): boolean {
  try {
    execFileSync("tmux", ["split-window", "-v", "-l", "10", "claudedino --attach"]);
    return true;
  } catch {
    return false;
  }
}

function splitWindowsTerminal(): boolean {
  try {
    execFileSync("wt", [
      "-w",
      "0",
      "sp",
      "-V",
      "--size",
      "0.3",
      "cmd",
      "/c",
      "claudedino --attach",
    ]);
    return true;
  } catch {
    return false;
  }
}

export function trySplit(terminal: Terminal): boolean {
  if (terminal === Terminal.ITerm2) {
    return splitIterm2();
  }
  if (terminal === Terminal.TerminalApp) {
    return splitTerminalApp();
  }
  if (terminal === Terminal.Tmux) {
    return splitTmux();
  }
  if (terminal === Terminal.WindowsTerminal) {
    return splitWindowsTerminal();
  }
  return false;
}
