export declare enum Platform {
    MacOS = "macos",
    Windows = "windows",
    Linux = "linux"
}
export declare enum Terminal {
    ITerm2 = "iterm2",
    TerminalApp = "terminal-app",
    WindowsTerminal = "windows-terminal",
    Tmux = "tmux",
    Unknown = "unknown"
}
export declare function detectPlatform(): Platform;
export declare function detectTerminal(): Terminal;
//# sourceMappingURL=detect.d.ts.map