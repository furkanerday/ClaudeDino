import { ClaudeState } from "../game/types.js";
export type StateChangeCallback = (state: ClaudeState) => void;
export declare function getStatePath(): string;
export declare function initStateFile(): void;
export declare function watchState(callback: StateChangeCallback): () => void;
//# sourceMappingURL=watcher.d.ts.map