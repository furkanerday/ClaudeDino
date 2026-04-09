import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { ClaudeState } from "./game/types.js";
import DinoGame from "./game/dino-game.js";
import { initStateFile, watchState } from "./state/watcher.js";
function App() {
    const [claudeState, setClaudeState] = useState(ClaudeState.Idle);
    useEffect(() => {
        initStateFile();
        const cleanup = watchState(setClaudeState);
        return cleanup;
    }, []);
    return _jsx(DinoGame, { claudeState: claudeState });
}
export default App;
//# sourceMappingURL=app.js.map