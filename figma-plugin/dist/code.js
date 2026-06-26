"use strict";
(() => {
  // src/sandbox/scanner.ts
  function scanFrameForTapAreas(frame) {
    const areas = [];
    const interactiveNodes = frame.findAll((node) => {
      return "reactions" in node && node.reactions.length > 0;
    });
    const frameBounds = frame.absoluteBoundingBox;
    if (!frameBounds) return areas;
    for (const node of interactiveNodes) {
      const sceneNode = node;
      const nodeBounds = sceneNode.absoluteBoundingBox;
      if (!nodeBounds) continue;
      const x = (nodeBounds.x - frameBounds.x) / frameBounds.width * 100;
      const y = (nodeBounds.y - frameBounds.y) / frameBounds.height * 100;
      const w = nodeBounds.width / frameBounds.width * 100;
      const h = nodeBounds.height / frameBounds.height * 100;
      if (x < 0 || y < 0 || x + w > 100 || y + h > 100) continue;
      if (w < 0.5 || h < 0.5) continue;
      let targetNodeId = null;
      let reactionType = "ON_CLICK";
      for (const reaction of sceneNode.reactions) {
        if (reaction.trigger) {
          reactionType = reaction.trigger.type;
        }
        if (reaction.actions) {
          for (const action of reaction.actions) {
            if (action.type === "NODE" && action.destinationId) {
              targetNodeId = action.destinationId;
              break;
            }
          }
        }
        if (targetNodeId) break;
      }
      areas.push({
        sourceNodeId: node.id,
        sourceNodeName: node.name,
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        w: Math.round(w * 100) / 100,
        h: Math.round(h * 100) / 100,
        targetNodeId,
        reactionType
      });
    }
    return areas;
  }
  function listAllFrames() {
    const frames = [];
    for (const page of figma.root.children) {
      for (const child of page.children) {
        if (child.type === "FRAME" || child.type === "COMPONENT") {
          frames.push({
            id: child.id,
            name: child.name,
            pageId: page.id,
            pageName: page.name,
            width: child.width,
            height: child.height
          });
        }
      }
    }
    return frames;
  }
  function navigateToNode(nodeId) {
    const node = figma.getNodeById(nodeId);
    if (!node || !("absoluteBoundingBox" in node)) return false;
    const sceneNode = node;
    const page = findParentPage(node);
    if (page && figma.currentPage !== page) {
      figma.currentPage = page;
    }
    figma.currentPage.selection = [sceneNode];
    figma.viewport.scrollAndZoomIntoView([sceneNode]);
    return true;
  }
  async function exportThumbnail(nodeId) {
    const node = figma.getNodeById(nodeId);
    if (!node || !("exportAsync" in node)) return null;
    try {
      const bytes = await node.exportAsync({
        format: "PNG",
        constraint: { type: "WIDTH", value: 240 }
      });
      const base64 = figma.base64Encode(bytes);
      return `data:image/png;base64,${base64}`;
    } catch (e) {
      console.error("Export failed:", e);
      return null;
    }
  }
  function findParentPage(node) {
    let current = node;
    while (current) {
      if (current.type === "PAGE") return current;
      current = current.parent;
    }
    return null;
  }
  function getFileInfo() {
    return {
      fileId: figma.fileKey || "",
      fileName: figma.root.name
    };
  }

  // src/sandbox/storage.ts
  var CONFIG_KEY = "multifig_config";
  var ROOM_KEY = "multifig_room_code";
  var SAAS_URL_KEY = "multifig_saas_url";
  function saveConfigToFile(config) {
    const data = JSON.stringify(config);
    if (data.length > 1e5) {
      console.warn(
        `Config is ${data.length} bytes, approaching 100KB pluginData limit`
      );
    }
    figma.root.setPluginData(CONFIG_KEY, data);
  }
  function loadConfigFromFile() {
    const raw = figma.root.getPluginData(CONFIG_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse stored config:", e);
      return null;
    }
  }
  async function loadRoomCode() {
    return await figma.clientStorage.getAsync(ROOM_KEY) || null;
  }
  async function loadSaasUrl() {
    return await figma.clientStorage.getAsync(SAAS_URL_KEY) || "https://multifig.vercel.app";
  }

  // src/sandbox/code.ts
  figma.showUI(__html__, {
    width: 420,
    height: 640,
    title: "MultiFig \u2014 Multi-Device Sync",
    themeColors: true
  });
  figma.ui.onmessage = async (msg) => {
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
          console.warn("Unknown message type:", msg.type);
      }
    } catch (error) {
      sendToUI({
        type: "ERROR",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };
  function handleScanFrame() {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify("\u26A0\uFE0F Please select a frame first", { timeout: 3e3 });
      sendToUI({ type: "ERROR", message: "No frame selected. Select a top-level frame on the canvas." });
      return;
    }
    const frame = selection[0];
    if (frame.type !== "FRAME" && frame.type !== "COMPONENT") {
      figma.notify("\u26A0\uFE0F Please select a Frame or Component, not a " + frame.type, {
        timeout: 3e3
      });
      sendToUI({ type: "ERROR", message: `Selected node is a ${frame.type}. Please select a Frame.` });
      return;
    }
    const areas = scanFrameForTapAreas(frame);
    figma.notify(
      areas.length > 0 ? `\u2705 Found ${areas.length} interactive element${areas.length > 1 ? "s" : ""}` : "No interactive elements found on this frame",
      { timeout: 3e3 }
    );
    sendToUI({
      type: "SCAN_RESULT",
      areas,
      screenId: frame.id,
      screenName: frame.name
    });
  }
  function handleScanAllFrames() {
    const allFrames = listAllFrames();
    let totalAreas = 0;
    for (const frameInfo of allFrames) {
      const node = figma.getNodeById(frameInfo.id);
      if (node && (node.type === "FRAME" || node.type === "COMPONENT")) {
        const areas = scanFrameForTapAreas(node);
        totalAreas += areas.length;
        if (areas.length > 0) {
          sendToUI({
            type: "SCAN_RESULT",
            areas,
            screenId: node.id,
            screenName: node.name
          });
        }
      }
    }
    figma.notify(
      `\u2705 Scanned ${allFrames.length} frames, found ${totalAreas} interactive elements`,
      { timeout: 4e3 }
    );
  }
  function handleListFrames() {
    const frames = listAllFrames();
    sendToUI({ type: "FRAMES_LIST", frames });
  }
  async function handleExportThumbnail(nodeId) {
    const data = await exportThumbnail(nodeId);
    if (data) {
      sendToUI({ type: "THUMBNAIL_RESULT", nodeId, data });
    } else {
      sendToUI({ type: "ERROR", message: `Failed to export thumbnail for node ${nodeId}` });
    }
  }
  function handleSaveConfig(config) {
    saveConfigToFile(config);
    figma.notify("\u{1F4BE} Config saved to Figma file", { timeout: 2e3 });
  }
  async function handleLoadConfig() {
    const config = loadConfigFromFile();
    const roomCode = await loadRoomCode();
    const saasUrl = await loadSaasUrl();
    if (config && roomCode && !config.roomCode) {
      config.roomCode = roomCode;
    }
    sendToUI({ type: "CONFIG_LOADED", config });
  }
  function handleGetFileInfo() {
    const info = getFileInfo();
    sendToUI({ type: "FILE_INFO", ...info });
  }
  function handleNavigateToNode(nodeId) {
    const success = navigateToNode(nodeId);
    if (!success) {
      figma.notify("\u26A0\uFE0F Could not find node " + nodeId, { timeout: 2e3 });
    }
  }
  function sendToUI(msg) {
    figma.ui.postMessage(msg);
  }
  figma.on("selectionchange", () => {
    const selection = figma.currentPage.selection;
    if (selection.length === 1) {
      const node = selection[0];
      if (node.type === "FRAME" || node.type === "COMPONENT") {
        sendToUI({
          type: "NOTIFY",
          message: `Selected: "${node.name}" (${node.width}\xD7${node.height})`
        });
      }
    }
  });
})();
