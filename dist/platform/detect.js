export var Platform;
(function (Platform) {
    Platform["MacOS"] = "macos";
    Platform["Windows"] = "windows";
    Platform["Linux"] = "linux";
})(Platform || (Platform = {}));
export var Terminal;
(function (Terminal) {
    Terminal["ITerm2"] = "iterm2";
    Terminal["TerminalApp"] = "terminal-app";
    Terminal["WindowsTerminal"] = "windows-terminal";
    Terminal["Tmux"] = "tmux";
    Terminal["Unknown"] = "unknown";
})(Terminal || (Terminal = {}));
export function detectPlatform() {
    if (process.platform === "darwin") {
        return Platform.MacOS;
    }
    if (process.platform === "win32") {
        return Platform.Windows;
    }
    return Platform.Linux;
}
function isEnvSet(key) {
    const value = process.env[key];
    return value !== undefined && value !== "";
}
export function detectTerminal() {
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
//# sourceMappingURL=detect.js.map