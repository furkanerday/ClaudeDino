export enum Platform {
  MacOS = "macos",
  Windows = "windows",
  Linux = "linux",
}

export enum Terminal {
  ITerm2 = "iterm2",
  TerminalApp = "terminal-app",
  WindowsTerminal = "windows-terminal",
  Tmux = "tmux",
  Unknown = "unknown",
}

export function detectPlatform(): Platform {
  if (process.platform === "darwin") {
    return Platform.MacOS;
  }
  if (process.platform === "win32") {
    return Platform.Windows;
  }
  return Platform.Linux;
}

function isEnvSet(key: string): boolean {
  const value = process.env[key];
  return value !== undefined && value !== "";
}

export function detectTerminal(): Terminal {
  if (isEnvSet("TMUX")) {
    return Terminal.Tmux;
  }

  const termProgram = process.env["TERM_PROGRAM"];

  if (termProgram === "iTerm.app") {
    return Terminal.ITerm2;
  }

  if (termProgram === "Apple_Terminal") {
    return Terminal.TerminalApp;
  }

  if (isEnvSet("WT_SESSION")) {
    return Terminal.WindowsTerminal;
  }

  return Terminal.Unknown;
}
