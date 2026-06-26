// MultiFig — Figma Plugin Sandbox Entry Point
// This file runs in Figma's sandbox and has access to the figma.* APIs.
// It communicates with the UI via postMessage / onmessage.

import type { PluginMessage, UIMessage } from "../shared/types";
import {
  scanFrameForTapAreas,
  listAllFrames,
  navigateToNode,
  exportThumbnail,
  getFileInfo,
} from "./scanner";
import {
  saveConfigToFile,
  loadConfigFromFile,
  saveRoomCode,
  loadRoomCode,
  loadSaasUrl,
} from "./storage";

// ── Show the Plugin UI ──────────────────────────────────────────────

figma.showUI(__html__, {
  width: 420,
  height: 640,
  title: "MultiFig — Multi-Device Sync",
  themeColors: true,
});

// ── Message Router ──────────────────────────────────────────────────

figma.ui.onmessage = async (msg: PluginMessage) => {
  try {
    switch (msg.type) {
      case "SCAN_FRAME":
        handleScanFrame();
        break;

      case "SCAN_ALL_FRAMES":
        handleScanAllFrames();
        break;

      case "LIST_FRAMES":
        handleListFrames();
        break;

      case "EXPORT_THUMBNAIL":
        await handleExportThumbnail(msg.nodeId);
        break;

      case "SAVE_CONFIG":
        handleSaveConfig(msg.config);
        break;

      case "LOAD_CONFIG":
        await handleLoadConfig();
        break;

      case "GET_FILE_INFO":
        handleGetFileInfo();
        break;

      case "NAVIGATE_TO_NODE":
        handleNavigateToNode(msg.nodeId);
        break;

      default:
        console.warn("Unknown message type:", (msg as any).type);
    }
  } catch (error) {
    sendToUI({
      type: "ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

// ── Handlers ────────────────────────────────────────────────────────

function handleScanFrame(): void {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("⚠️ Please select a frame first", { timeout: 3000 });
    sendToUI({ type: "ERROR", message: "No frame selected. Select a top-level frame on the canvas." });
    return;
  }

  const frame = selection[0];

  if (frame.type !== "FRAME" && frame.type !== "COMPONENT") {
    figma.notify("⚠️ Please select a Frame or Component, not a " + frame.type, {
      timeout: 3000,
    });
    sendToUI({ type: "ERROR", message: `Selected node is a ${frame.type}. Please select a Frame.` });
    return;
  }

  const areas = scanFrameForTapAreas(frame as FrameNode);

  figma.notify(
    areas.length > 0
      ? `✅ Found ${areas.length} interactive element${areas.length > 1 ? "s" : ""}`
      : "No interactive elements found on this frame",
    { timeout: 3000 }
  );

  sendToUI({
    type: "SCAN_RESULT",
    areas,
    screenId: frame.id,
    screenName: frame.name,
  });
}

function handleScanAllFrames(): void {
  const allFrames = listAllFrames();
  let totalAreas = 0;

  // Scan each top-level frame and send results
  for (const frameInfo of allFrames) {
    const node = figma.getNodeById(frameInfo.id);
    if (node && (node.type === "FRAME" || node.type === "COMPONENT")) {
      const areas = scanFrameForTapAreas(node as FrameNode);
      totalAreas += areas.length;

      if (areas.length > 0) {
        sendToUI({
          type: "SCAN_RESULT",
          areas,
          screenId: node.id,
          screenName: node.name,
        });
      }
    }
  }

  figma.notify(
    `✅ Scanned ${allFrames.length} frames, found ${totalAreas} interactive elements`,
    { timeout: 4000 }
  );
}

function handleListFrames(): void {
  const frames = listAllFrames();
  sendToUI({ type: "FRAMES_LIST", frames });
}

async function handleExportThumbnail(nodeId: string): Promise<void> {
  const data = await exportThumbnail(nodeId);
  if (data) {
    sendToUI({ type: "THUMBNAIL_RESULT", nodeId, data });
  } else {
    sendToUI({ type: "ERROR", message: `Failed to export thumbnail for node ${nodeId}` });
  }
}

function handleSaveConfig(config: any): void {
  saveConfigToFile(config);
  figma.notify("💾 Config saved to Figma file", { timeout: 2000 });
}

async function handleLoadConfig(): Promise<void> {
  const config = loadConfigFromFile();
  const roomCode = await loadRoomCode();
  const saasUrl = await loadSaasUrl();

  // Merge room code from client storage into the config
  if (config && roomCode && !config.roomCode) {
    config.roomCode = roomCode;
  }

  sendToUI({ type: "CONFIG_LOADED", config });
}

function handleGetFileInfo(): void {
  const info = getFileInfo();
  sendToUI({ type: "FILE_INFO", ...info });
}

function handleNavigateToNode(nodeId: string): void {
  const success = navigateToNode(nodeId);
  if (!success) {
    figma.notify("⚠️ Could not find node " + nodeId, { timeout: 2000 });
  }
}

// ── Utilities ───────────────────────────────────────────────────────

function sendToUI(msg: UIMessage): void {
  figma.ui.postMessage(msg);
}

// ── Selection Change Listener ───────────────────────────────────────
// When the user selects a different frame, notify the UI

figma.on("selectionchange", () => {
  const selection = figma.currentPage.selection;
  if (selection.length === 1) {
    const node = selection[0];
    if (node.type === "FRAME" || node.type === "COMPONENT") {
      sendToUI({
        type: "NOTIFY",
        message: `Selected: "${node.name}" (${node.width}×${node.height})`,
      });
    }
  }
});
