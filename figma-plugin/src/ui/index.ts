// MultiFig — Plugin UI Logic
// This runs inside the iframe. Communicates with the sandbox via postMessage.

import type {
  MultiFigConfig,
  Device,
  Screen,
  TapArea,
  DetectedArea,
  FrameInfo,
  FrameMapping,
  UIMessage,
  PluginMessage,
} from "../shared/types";

// ── State ───────────────────────────────────────────────────────────

interface AppState {
  fileId: string;
  fileName: string;
  frames: FrameInfo[];
  devices: Device[];
  detectedAreas: Map<string, DetectedArea[]>; // screenId → areas
  tapAreas: TapArea[];
  roomCode: string;
  saasUrl: string;
}

const state: AppState = {
  fileId: "",
  fileName: "",
  frames: [],
  devices: [
    { id: "controller", name: "Controller", startingScreenId: "", scale: 1 },
    { id: "target-0", name: "Main Display", startingScreenId: "", scale: 1.14 },
  ],
  detectedAreas: new Map(),
  tapAreas: [],
  roomCode: "",
  saasUrl: "https://multifig.vercel.app",
};

// ── Initialize ──────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initDevicePanel();
  initAreaPanel();
  initSyncPanel();

  // Request initial data from sandbox
  sendToSandbox({ type: "GET_FILE_INFO" });
  sendToSandbox({ type: "LIST_FRAMES" });
  sendToSandbox({ type: "LOAD_CONFIG" });
});

// ── Message Handler (from Sandbox) ──────────────────────────────────

window.onmessage = (event: MessageEvent) => {
  const msg = event.data.pluginMessage as UIMessage;
  if (!msg) return;

  switch (msg.type) {
    case "SCAN_RESULT":
      handleScanResult(msg.areas, msg.screenId, msg.screenName);
      break;

    case "FRAMES_LIST":
      state.frames = msg.frames;
      updateFrameCount();
      refreshFrameSelectors();
      break;

    case "CONFIG_LOADED":
      if (msg.config) {
        loadConfig(msg.config);
      }
      break;

    case "FILE_INFO":
      state.fileId = msg.fileId;
      state.fileName = msg.fileName;
      el("file-name").textContent = msg.fileName || "—";
      break;

    case "THUMBNAIL_RESULT":
      // Could be used for flow viz later
      break;

    case "ERROR":
      showToast(msg.message, "error");
      break;

    case "NOTIFY":
      setStatus(msg.message);
      break;
  }
};

// ── Tab Navigation ──────────────────────────────────────────────────

function initTabs(): void {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      const panelId = `panel-${(tab as HTMLElement).dataset.tab}`;
      document.getElementById(panelId)?.classList.add("active");
    });
  });
}

// ── Device Panel ────────────────────────────────────────────────────

function initDevicePanel(): void {
  el("add-device-btn").addEventListener("click", () => {
    const idx = state.devices.filter((d) => d.id.startsWith("target-")).length;
    state.devices.push({
      id: `target-${idx}`,
      name: `Display ${idx + 1}`,
      startingScreenId: "",
      scale: 1.14,
    });
    renderDevices();
  });

  renderDevices();
}

function renderDevices(): void {
  const container = el("devices-list");
  container.innerHTML = "";

  state.devices.forEach((device, i) => {
    const card = document.createElement("div");
    card.className = "device-card";
    card.innerHTML = `
      <div class="device-card-header">
        <input type="text" value="${escHtml(device.name)}" 
               style="background:none; border:none; font-weight:700; font-size:13px; color:var(--text-primary); width:auto; padding:0;"
               data-device-idx="${i}" data-field="name">
        ${device.id !== "controller" ? `<button class="btn btn-danger btn-sm" data-remove-device="${i}">✕</button>` : ""}
      </div>
      <div class="field">
        <label>Starting Frame</label>
        <select data-device-idx="${i}" data-field="startingScreenId">
          <option value="">— Select a frame —</option>
          ${state.frames.map((f) => `<option value="${f.id}" ${f.id === device.startingScreenId ? "selected" : ""}>${f.name} (${f.pageName})</option>`).join("")}
        </select>
      </div>
      <div class="row">
        <div class="field">
          <label>ID</label>
          <div style="font-family:monospace; font-size:10px; color:var(--text-muted);">${device.id}</div>
        </div>
        <div class="field">
          <label>Scale</label>
          <input type="number" step="0.01" value="${device.scale}" 
                 data-device-idx="${i}" data-field="scale" style="width: 70px;">
        </div>
      </div>
    `;

    // Event: update device fields
    card.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        const idx = parseInt(target.dataset.deviceIdx || "0");
        const field = target.dataset.field as keyof Device;
        if (field === "scale") {
          (state.devices[idx] as any)[field] = parseFloat(target.value);
        } else {
          (state.devices[idx] as any)[field] = target.value;
        }
      });
    });

    // Event: remove device
    card.querySelector("[data-remove-device]")?.addEventListener("click", (e) => {
      const idx = parseInt((e.target as HTMLElement).dataset.removeDevice || "0");
      state.devices.splice(idx, 1);
      renderDevices();
    });

    container.appendChild(card);
  });
}

// ── Tap Area Panel ──────────────────────────────────────────────────

function initAreaPanel(): void {
  el("scan-frame-btn").addEventListener("click", () => {
    setStatus("Scanning selected frame...");
    sendToSandbox({ type: "SCAN_FRAME" });
  });

  el("scan-all-btn").addEventListener("click", () => {
    setStatus("Scanning all frames...");
    sendToSandbox({ type: "SCAN_ALL_FRAMES" });
  });
}

function handleScanResult(areas: DetectedArea[], screenId: string, screenName: string): void {
  // Store detected areas
  state.detectedAreas.set(screenId, areas);

  // Convert detected areas to TapAreas (remove duplicates by sourceNodeId)
  for (const area of areas) {
    const exists = state.tapAreas.find(
      (ta) => ta.sourceNodeId === area.sourceNodeId && ta.screenId === screenId
    );
    if (!exists) {
      state.tapAreas.push({
        id: `tap-${area.sourceNodeId}`,
        screenId,
        sourceNodeId: area.sourceNodeId,
        sourceNodeName: area.sourceNodeName,
        x: area.x,
        y: area.y,
        w: area.w,
        h: area.h,
        action: area.targetNodeId ? "jump" : "next",
        frameMappings: area.targetNodeId
          ? state.devices
              .filter((d) => d.id !== "controller")
              .map((d) => ({
                deviceId: d.id,
                targetScreenId: area.targetNodeId || "",
              }))
          : [],
      });
    }
  }

  renderAreas();
  setStatus(`Found ${areas.length} interactive elements on "${screenName}"`);
  showToast(`✅ Found ${areas.length} interactive elements`, "success");
}

function renderAreas(): void {
  const container = el("areas-list");
  el("area-count").textContent = String(state.tapAreas.length);

  if (state.tapAreas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <div class="empty-state-title">No tap areas yet</div>
        <div>Select a frame and click "Scan" to auto-detect interactive elements.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  // Group by screen
  const byScreen = new Map<string, TapArea[]>();
  for (const area of state.tapAreas) {
    if (!byScreen.has(area.screenId)) byScreen.set(area.screenId, []);
    byScreen.get(area.screenId)!.push(area);
  }

  for (const [screenId, areas] of byScreen) {
    const screenFrame = state.frames.find((f) => f.id === screenId);
    const screenLabel = screenFrame ? screenFrame.name : screenId;

    const group = document.createElement("div");
    group.innerHTML = `<div style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:6px; margin-top:4px;">📐 ${escHtml(screenLabel)}</div>`;

    for (const area of areas) {
      const card = document.createElement("div");
      card.className = "area-card";
      card.innerHTML = `
        <div class="area-card-header">
          <div class="area-card-name">
            <span class="area-badge area-badge-auto">AUTO</span>
            ${escHtml(area.sourceNodeName)}
          </div>
          <div class="row" style="flex:0; gap:4px;">
            <button class="btn btn-secondary btn-sm" data-navigate="${area.sourceNodeId}" title="Select on canvas">🔍</button>
            <button class="btn btn-danger btn-sm" data-remove-area="${area.id}" title="Remove">✕</button>
          </div>
        </div>
        <div class="area-coords">
          x: ${area.x.toFixed(1)}%  y: ${area.y.toFixed(1)}%  w: ${area.w.toFixed(1)}%  h: ${area.h.toFixed(1)}%
        </div>
        <div style="margin-top: 8px;">
          <label>Action</label>
          <select data-area-id="${area.id}" data-field="action">
            <option value="jump" ${area.action === "jump" ? "selected" : ""}>Jump to Frame</option>
            <option value="next" ${area.action === "next" ? "selected" : ""}>Next Frame</option>
            <option value="prev" ${area.action === "prev" ? "selected" : ""}>Previous Frame</option>
          </select>
        </div>
        ${area.action === "jump" ? renderMappings(area) : ""}
      `;

      // Navigate to node on canvas
      card.querySelector("[data-navigate]")?.addEventListener("click", (e) => {
        const nodeId = (e.target as HTMLElement).closest("[data-navigate]")?.getAttribute("data-navigate");
        if (nodeId) sendToSandbox({ type: "NAVIGATE_TO_NODE", nodeId });
      });

      // Remove area
      card.querySelector("[data-remove-area]")?.addEventListener("click", (e) => {
        const areaId = (e.target as HTMLElement).closest("[data-remove-area]")?.getAttribute("data-remove-area");
        if (areaId) {
          state.tapAreas = state.tapAreas.filter((a) => a.id !== areaId);
          renderAreas();
        }
      });

      // Action change
      card.querySelector("[data-field='action']")?.addEventListener("change", (e) => {
        const target = e.target as HTMLSelectElement;
        const areaId = target.dataset.areaId;
        const tapArea = state.tapAreas.find((a) => a.id === areaId);
        if (tapArea) {
          tapArea.action = target.value as TapArea["action"];
          renderAreas();
        }
      });

      // Mapping changes
      card.querySelectorAll("[data-mapping-device]").forEach((select) => {
        select.addEventListener("change", (e) => {
          const sel = e.target as HTMLSelectElement;
          const areaId = sel.dataset.areaId;
          const deviceId = sel.dataset.mappingDevice;
          const tapArea = state.tapAreas.find((a) => a.id === areaId);
          if (tapArea && deviceId) {
            const mapping = tapArea.frameMappings.find((m) => m.deviceId === deviceId);
            if (mapping) {
              mapping.targetScreenId = sel.value;
            } else {
              tapArea.frameMappings.push({ deviceId, targetScreenId: sel.value });
            }
          }
        });
      });

      group.appendChild(card);
    }

    container.appendChild(group);
  }
}

function renderMappings(area: TapArea): string {
  return state.devices
    .filter((d) => d.id !== "controller")
    .map((device) => {
      const mapping = area.frameMappings.find((m) => m.deviceId === device.id);
      const targetId = mapping?.targetScreenId || "";

      return `
        <div class="mapping-row">
          <span class="mapping-device">${escHtml(device.name)}</span>
          <span class="mapping-arrow">→</span>
          <select data-area-id="${area.id}" data-mapping-device="${device.id}" style="flex:1;">
            <option value="">— Select target —</option>
            ${state.frames.map((f) => `<option value="${f.id}" ${f.id === targetId ? "selected" : ""}>${f.name}</option>`).join("")}
          </select>
        </div>
      `;
    })
    .join("");
}

// ── Sync Panel ──────────────────────────────────────────────────────

function initSyncPanel(): void {
  el("push-btn").addEventListener("click", () => pushToCloud());
  el("save-to-file-btn").addEventListener("click", () => saveToFile());
  el("load-from-file-btn").addEventListener("click", () => {
    sendToSandbox({ type: "LOAD_CONFIG" });
    showToast("Loading config from file...", "success");
  });
  el("export-json-btn").addEventListener("click", () => exportJson());
}

function buildConfig(): MultiFigConfig {
  return {
    version: 2,
    fileId: state.fileId,
    fileName: state.fileName,
    roomCode: (el("room-code-input") as HTMLInputElement).value.toUpperCase(),
    devices: state.devices,
    screens: state.frames.map((f) => ({
      id: f.id,
      name: f.name,
      pageId: f.pageId,
    })),
    tapAreas: state.tapAreas,
    keyBindings: [],
    updatedAt: new Date().toISOString(),
  };
}

async function pushToCloud(): Promise<void> {
  const roomCode = (el("room-code-input") as HTMLInputElement).value.toUpperCase().trim();
  if (!roomCode || roomCode.length < 4) {
    showToast("Enter a 4-character room code", "error");
    return;
  }

  const saasUrl = (el("saas-url-input") as HTMLInputElement).value.trim();
  const config = buildConfig();
  config.roomCode = roomCode;

  setStatus("Pushing config to cloud...");

  try {
    const resp = await fetch(`${saasUrl}/api/rooms/${roomCode}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    showToast(`✅ Pushed to room ${roomCode}`, "success");
    setStatus(`Synced to room ${roomCode}`);
  } catch (e) {
    showToast(`Failed to push: ${e}`, "error");
    setStatus("Push failed");
  }
}

function saveToFile(): void {
  const config = buildConfig();
  sendToSandbox({ type: "SAVE_CONFIG", config });
  showToast("💾 Saved to Figma file", "success");
}

function exportJson(): void {
  const config = buildConfig();
  const json = JSON.stringify(config, null, 2);

  // Copy to clipboard via a temporary textarea
  const ta = document.createElement("textarea");
  ta.value = json;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);

  showToast("📋 Config copied to clipboard", "success");
}

function loadConfig(config: MultiFigConfig): void {
  if (config.devices?.length) state.devices = config.devices;
  if (config.tapAreas?.length) state.tapAreas = config.tapAreas;
  if (config.roomCode) {
    (el("room-code-input") as HTMLInputElement).value = config.roomCode;
  }

  renderDevices();
  renderAreas();
  setStatus("Config loaded");
  showToast("Config loaded from file", "success");
}

// ── Utilities ───────────────────────────────────────────────────────

function el(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function escHtml(str: string): string {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function sendToSandbox(msg: PluginMessage): void {
  parent.postMessage({ pluginMessage: msg }, "*");
}

function setStatus(text: string): void {
  el("status-text").textContent = text;
}

function updateFrameCount(): void {
  el("frame-count").textContent = String(state.frames.length);
}

function refreshFrameSelectors(): void {
  // Re-render devices to update frame dropdowns
  renderDevices();
}

let toastTimeout: ReturnType<typeof setTimeout>;

function showToast(message: string, type: "success" | "error"): void {
  const toast = el("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
