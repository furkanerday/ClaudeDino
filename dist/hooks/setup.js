import * as fs from "node:fs";
import * as os from "node:os";
import { dirname, join } from "node:path";
import { getStatePath } from "../state/watcher.js";
const HOOK_TAG = "# claudedino";
function getSettingsPath() {
    return join(os.homedir(), ".claude", "settings.json");
}
function readSettings() {
    try {
        const buffer = fs.readFileSync(getSettingsPath());
        return JSON.parse(buffer.toString());
    }
    catch {
        return {};
    }
}
function writeSettings(settings) {
    const settingsPath = getSettingsPath();
    const dir = dirname(settingsPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(settingsPath, `${JSON.stringify(settings, undefined, 2)}\n`);
}
function createHookEventConfig(matcher, command) {
    return {
        matcher,
        hooks: [{ type: "command", command }],
    };
}
function buildHookEntries() {
    const statePath = getStatePath();
    return [
        ["PreToolUse", createHookEventConfig("", `echo working > ${statePath} ${HOOK_TAG}`)],
        ["PostToolUse", createHookEventConfig("", `echo idle > ${statePath} ${HOOK_TAG}`)],
        ["Notification", createHookEventConfig("idle_prompt", `echo idle > ${statePath} ${HOOK_TAG}`)],
    ];
}
function isClaudeDinoHookEntry(entry) {
    return entry.hooks.some((hook) => hook.command.includes(HOOK_TAG));
}
export function setupHooks() {
    const settings = readSettings();
    const dinoHookEntries = buildHookEntries();
    const existingHooks = settings.hooks ?? {};
    for (const [event, config] of dinoHookEntries) {
        const existing = existingHooks[event] ?? [];
        const filtered = existing.filter((entry) => !isClaudeDinoHookEntry(entry));
        existingHooks[event] = [...filtered, config];
    }
    settings.hooks = existingHooks;
    writeSettings(settings);
}
export function removeHooks() {
    const settings = readSettings();
    if (settings.hooks === undefined) {
        return;
    }
    const hooks = settings.hooks;
    const cleanedHooks = {};
    for (const [event, configs] of Object.entries(hooks)) {
        const filtered = configs.filter((entry) => !isClaudeDinoHookEntry(entry));
        if (filtered.length > 0) {
            cleanedHooks[event] = filtered;
        }
    }
    if (Object.keys(cleanedHooks).length === 0) {
        delete settings.hooks;
    }
    else {
        settings.hooks = cleanedHooks;
    }
    writeSettings(settings);
}
//# sourceMappingURL=setup.js.map