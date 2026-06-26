// MultiFig — Storage Helpers
// Handles persistence via pluginData (on Figma nodes) and clientStorage (local)

import type { MultiFigConfig } from "../shared/types";

const CONFIG_KEY = "multifig_config";
const ROOM_KEY = "multifig_room_code";
const SAAS_URL_KEY = "multifig_saas_url";

// ── Plugin Data (persists with the Figma file) ──────────────────────

/**
 * Save the full MultiFig config to the document root.
 * This data travels with the .fig file and is available to all collaborators.
 */
export function saveConfigToFile(config: MultiFigConfig): void {
  const data = JSON.stringify(config);

  // Check 100KB limit
  if (data.length > 100_000) {
    console.warn(
      `Config is ${data.length} bytes, approaching 100KB pluginData limit`
    );
  }

  figma.root.setPluginData(CONFIG_KEY, data);
}

/**
 * Load the MultiFig config from the document root.
 */
export function loadConfigFromFile(): MultiFigConfig | null {
  const raw = figma.root.getPluginData(CONFIG_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as MultiFigConfig;
  } catch (e) {
    console.error("Failed to parse stored config:", e);
    return null;
  }
}

/**
 * Clear the stored config from the document.
 */
export function clearConfigFromFile(): void {
  figma.root.setPluginData(CONFIG_KEY, "");
}

// ── Client Storage (local to this machine, not shared) ──────────────

/**
 * Save the room code to local client storage.
 */
export async function saveRoomCode(code: string): Promise<void> {
  await figma.clientStorage.setAsync(ROOM_KEY, code);
}

/**
 * Load the last-used room code from local client storage.
 */
export async function loadRoomCode(): Promise<string | null> {
  return (await figma.clientStorage.getAsync(ROOM_KEY)) || null;
}

/**
 * Save the SaaS URL to local client storage.
 */
export async function saveSaasUrl(url: string): Promise<void> {
  await figma.clientStorage.setAsync(SAAS_URL_KEY, url);
}

/**
 * Load the SaaS URL from local client storage.
 * Defaults to production URL if not set.
 */
export async function loadSaasUrl(): Promise<string> {
  return (
    (await figma.clientStorage.getAsync(SAAS_URL_KEY)) ||
    "https://multifig.vercel.app"
  );
}

// ── Node-Level Plugin Data ──────────────────────────────────────────

/**
 * Mark a specific node as a MultiFig tap area.
 * Stores the tap area config directly on the node.
 */
export function markNodeAsTapArea(
  nodeId: string,
  data: Record<string, unknown>
): void {
  const node = figma.getNodeById(nodeId);
  if (!node) return;

  node.setPluginData("multifig_tap_area", JSON.stringify(data));
}

/**
 * Read MultiFig tap area data from a node.
 */
export function getNodeTapAreaData(
  nodeId: string
): Record<string, unknown> | null {
  const node = figma.getNodeById(nodeId);
  if (!node) return null;

  const raw = node.getPluginData("multifig_tap_area");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
