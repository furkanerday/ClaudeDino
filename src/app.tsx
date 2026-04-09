import React, { useEffect, useState } from "react";

import { ClaudeState } from "./game/types.js";
import DinoGame from "./game/dino-game.js";
import { initStateFile, watchState } from "./state/watcher.js";

function App(): React.ReactElement {
  const [claudeState, setClaudeState] = useState<ClaudeState>(ClaudeState.Idle);

  useEffect(() => {
    initStateFile();
    const cleanup = watchState(setClaudeState);
    return cleanup;
  }, []);

  return <DinoGame claudeState={claudeState} />;
}

export default App;
