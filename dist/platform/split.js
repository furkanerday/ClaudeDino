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
function tryExec(command, args) {
    try {
        execFileSync(command, args);
        return true;
    }
    catch {
        return false;
    }
}
const SPLIT_COMMANDS = {
    [Terminal.ITerm2]: ["osascript", ["-e", ITERM2_SCRIPT]],
    [Terminal.TerminalApp]: ["osascript", ["-e", TERMINAL_APP_SCRIPT]],
    [Terminal.Tmux]: ["tmux", ["split-window", "-v", "-l", "10", "claudedino --attach"]],
    [Terminal.WindowsTerminal]: [
        "wt",
        ["-w", "0", "sp", "-V", "--size", "0.3", "cmd", "/c", "claudedino --attach"],
    ],
};
export function trySplit(terminal) {
    const entry = SPLIT_COMMANDS[terminal];
    if (entry === undefined) {
        return false;
    }
    return tryExec(entry[0], entry[1]);
}
//# sourceMappingURL=split.js.map