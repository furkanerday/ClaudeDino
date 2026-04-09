import * as fs from "node:fs";
import * as os from "node:os";
import { join } from "node:path";
import { ClaudeState } from "../game/types.js";
const STATE_FILE_NAME = "claudedino-state";
export function getStatePath() {
    return join(os.tmpdir(), STATE_FILE_NAME);
}
export function initStateFile() {
    try {
        fs.writeFileSync(getStatePath(), "idle\n");
    }
    catch {
        // silently ignore errors
    }
}
function readStateSafe(filePath) {
    try {
        const trimmed = fs.readFileSync(filePath, "utf8").trim();
        return trimmed === ClaudeState.Working ? ClaudeState.Working : ClaudeState.Idle;
    }
    catch {
        return ClaudeState.Idle;
    }
}
export function watchState(callback) {
    const filePath = getStatePath();
    let lastState = readStateSafe(filePath);
    callback(lastState);
    const watcher = fs.watch(filePath, () => {
        const current = readStateSafe(filePath);
        if (current !== lastState) {
            lastState = current;
            callback(current);
        }
    });
    watcher.on("error", () => {
        // File may be deleted or OS watch failed — ignore silently
    });
    return () => {
        watcher.close();
    };
}
//# sourceMappingURL=watcher.js.map