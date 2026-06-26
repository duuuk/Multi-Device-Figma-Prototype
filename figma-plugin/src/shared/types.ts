// MultiFig — Shared Type Definitions
// Used by: Figma Plugin, SaaS Web App, Legacy Local Server

export interface MultiFigConfig {
  version: 2;
  fileId: string;
  fileName: string;
  roomCode: string;
  devices: Device[];
  screens: Screen[];
  tapAreas: TapArea[];
  keyBindings: KeyBinding[];
  updatedAt: string;
}

export interface Device {
  id: string;            // "controller" | "target-0" | "target-1" ...
  name: string;          // "Main Display", "Left iPad"
  startingScreenId: string;
  scale: number;         // Default 1.14
}

export interface Screen {
  id: string;            // Figma node ID e.g. "567:13914"
  name: string;          // Figma frame name
  pageId: string;        // Figma page ID
  thumbnail?: string;    // Base64 PNG (optional, for flow viz)
  protoUrl?: string;     // Full constructed prototype URL
}

export interface TapArea {
  id: string;
  screenId: string;      // Which screen this area lives on
  sourceNodeId: string;  // Figma node ID of the interactive element
  sourceNodeName: string;
  x: number;             // % from left of parent frame
  y: number;             // % from top of parent frame
  w: number;             // % width
  h: number;             // % height
  action: "jump" | "next" | "prev";
  frameMappings: FrameMapping[];
}

export interface FrameMapping {
  deviceId: string;
  targetScreenId: string;
}

export interface KeyBinding {
  key: string;
  label: string;
  frameMappings: FrameMapping[];
}

// Detected area from the scanner (before user configures mappings)
export interface DetectedArea {
  sourceNodeId: string;
  sourceNodeName: string;
  x: number;
  y: number;
  w: number;
  h: number;
  targetNodeId: string | null;  // From Figma's native reactions
  reactionType: string;         // e.g. "ON_CLICK", "ON_HOVER"
}

// Frame info for the picker
export interface FrameInfo {
  id: string;
  name: string;
  pageId: string;
  pageName: string;
  width: number;
  height: number;
}

// Messages between plugin sandbox (code.ts) and UI
export type PluginMessage =
  | { type: "SCAN_FRAME" }
  | { type: "SCAN_ALL_FRAMES" }
  | { type: "LIST_FRAMES" }
  | { type: "EXPORT_THUMBNAIL"; nodeId: string }
  | { type: "SAVE_CONFIG"; config: MultiFigConfig }
  | { type: "LOAD_CONFIG" }
  | { type: "GET_FILE_INFO" }
  | { type: "NAVIGATE_TO_NODE"; nodeId: string }
  | { type: "MARK_TAP_AREA"; nodeId: string; data: Partial<TapArea> };

export type UIMessage =
  | { type: "SCAN_RESULT"; areas: DetectedArea[]; screenId: string; screenName: string }
  | { type: "FRAMES_LIST"; frames: FrameInfo[] }
  | { type: "THUMBNAIL_RESULT"; nodeId: string; data: string }
  | { type: "CONFIG_LOADED"; config: MultiFigConfig | null }
  | { type: "FILE_INFO"; fileId: string; fileName: string }
  | { type: "ERROR"; message: string }
  | { type: "NOTIFY"; message: string };
