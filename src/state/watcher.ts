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

function readStateSafe(filePath: string): ClaudeState {
  try {
    const trimmed = fs.readFileSync(filePath, "utf8").trim();
    return trimmed === (ClaudeState.Working as string) ? ClaudeState.Working : ClaudeState.Idle;
  } catch {
    return ClaudeState.Idle;
  }
}

export function watchState(callback: StateChangeCallback): () => void {
  const filePath = getStatePath();
  let lastState: ClaudeState = readStateSafe(filePath);

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

  return (): void => {
    watcher.close();
  };
}
