#!/usr/bin/env node

import React from "react";
import { render } from "ink";

import App from "./app.js";
import { setupHooks } from "./hooks/setup.js";
import { detectTerminal } from "./platform/detect.js";
import { trySplit } from "./platform/split.js";

const attachFlag = process.argv.includes("--attach");

if (!attachFlag) {
  setupHooks();
  const terminal = detectTerminal();
  const didSplit = trySplit(terminal);

  if (didSplit) {
    process.exit(0);
  }

  process.stdout.write("Could not auto-split terminal. Running game inline.\n");
}

render(React.createElement(App));
