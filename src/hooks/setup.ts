import * as fs from "node:fs";
import * as os from "node:os";
import { dirname, join } from "node:path";

const HOOK_TAG = "# claudedino";

interface HookEntry {
  type: string;
  command: string;
}

interface HookEventConfig {
  matcher: string;
  hooks: HookEntry[];
}

interface ClaudeSettings {
  hooks?: Record<string, HookEventConfig[]>;
  [key: string]: unknown;
}

function getSettingsPath(): string {
  return join(os.homedir(), ".claude", "settings.json");
}

function readSettings(): ClaudeSettings {
  const settingsPath = getSettingsPath();
  if (!fs.existsSync(settingsPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(settingsPath).toString()) as ClaudeSettings;
}

function writeSettings(settings: ClaudeSettings): void {
  const settingsPath = getSettingsPath();
  const dir = dirname(settingsPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(settingsPath, `${JSON.stringify(settings, undefined, 2)}\n`);
}

function buildStatePath(): string {
  return join(os.tmpdir(), "claudedino-state");
}

function createHookEventConfig(matcher: string, command: string): HookEventConfig {
  return {
    matcher,
    hooks: [{ type: "command", command }],
  };
}

function buildHookEntries(): [string, HookEventConfig][] {
  const statePath = buildStatePath();

  return [
    ["PreToolUse", createHookEventConfig("", `echo working > ${statePath} ${HOOK_TAG}`)],
    ["PostToolUse", createHookEventConfig("", `echo idle > ${statePath} ${HOOK_TAG}`)],
    ["Notification", createHookEventConfig("idle_prompt", `echo idle > ${statePath} ${HOOK_TAG}`)],
  ];
}

function isClaudeDinoHookEntry(entry: HookEventConfig): boolean {
  return entry.hooks.some((hook) => hook.command.includes(HOOK_TAG));
}

export function setupHooks(): void {
  const settings = readSettings();
  const dinoHookEntries = buildHookEntries();

  const existingHooks: Record<string, HookEventConfig[]> = settings.hooks ?? {};

  for (const [event, config] of dinoHookEntries) {
    const existing: HookEventConfig[] = existingHooks[event] ?? [];
    const filtered = existing.filter((entry) => !isClaudeDinoHookEntry(entry));
    existingHooks[event] = [...filtered, config];
  }

  settings.hooks = existingHooks;
  writeSettings(settings);
}

export function removeHooks(): void {
  const settings = readSettings();

  if (settings.hooks === undefined) {
    return;
  }

  const hooks = settings.hooks;
  const cleanedHooks: Record<string, HookEventConfig[]> = {};

  for (const [event, configs] of Object.entries(hooks)) {
    const filtered = configs.filter((entry) => !isClaudeDinoHookEntry(entry));
    if (filtered.length > 0) {
      cleanedHooks[event] = filtered;
    }
  }

  if (Object.keys(cleanedHooks).length === 0) {
    delete settings.hooks;
  } else {
    settings.hooks = cleanedHooks;
  }

  writeSettings(settings);
}
