import * as fs from "node:fs";
import * as os from "node:os";
import { join } from "node:path";

import { ClaudeState } from "../game/types.js";

export type StateChangeCallback = (state: ClaudeState) => void;

const STATE_FILE_NAME = "claudedino-state";

export function getStatePath(): string {
  return join(os.tmpdir(), STATE_FILE_NAME);
}

export function initStateFile(): void {
  try {
    fs.writeFileSync(getStatePath(), "idle\n");
  } catch {
    // silently ignore errors
  }
}

function parseState(raw: string): ClaudeState {
  const trimmed = raw.trim();
  if (trimmed === "working") {
    return ClaudeState.Working;
  }
  return ClaudeState.Idle;
}

export function watchState(callback: StateChangeCallback): () => void {
  const filePath = getStatePath();
  let lastState: ClaudeState = parseState(
    fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "idle",
  );

  callback(lastState);

  const watcher = fs.watch(filePath, () => {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const current = parseState(raw);
      if (current !== lastState) {
        lastState = current;
        callback(current);
      }
    } catch {
      // file may be temporarily unavailable
    }
  });

  return (): void => {
    watcher.close();
  };
}
