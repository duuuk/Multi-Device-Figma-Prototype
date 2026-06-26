// MultiFig — Core Node Scanner
// Runs in Figma's sandbox context (has access to figma.* APIs)

import type { DetectedArea, FrameInfo } from "../shared/types";

/**
 * Scan a frame for all interactive nodes (nodes with prototyping reactions).
 * Returns pixel-perfect percentage coordinates relative to the parent frame.
 */
export function scanFrameForTapAreas(frame: FrameNode | ComponentNode): DetectedArea[] {
  const areas: DetectedArea[] = [];

  // Find all nodes in this frame that have prototyping reactions
  const interactiveNodes = frame.findAll((node) => {
    return "reactions" in node && 
      (node as FrameNode | ComponentNode | InstanceNode | GroupNode | VectorNode | TextNode).reactions.length > 0;
  });

  const frameBounds = frame.absoluteBoundingBox;
  if (!frameBounds) return areas;

  for (const node of interactiveNodes) {
    const sceneNode = node as SceneNode;
    const nodeBounds = sceneNode.absoluteBoundingBox;

    if (!nodeBounds) continue;

    // Calculate percentage position relative to the parent frame
    const x = ((nodeBounds.x - frameBounds.x) / frameBounds.width) * 100;
    const y = ((nodeBounds.y - frameBounds.y) / frameBounds.height) * 100;
    const w = (nodeBounds.width / frameBounds.width) * 100;
    const h = (nodeBounds.height / frameBounds.height) * 100;

    // Skip nodes that are outside the frame bounds (clipped elements)
    if (x < 0 || y < 0 || x + w > 100 || y + h > 100) continue;
    // Skip extremely tiny elements (likely decorative)
    if (w < 0.5 || h < 0.5) continue;

    // Extract reaction info
    let targetNodeId: string | null = null;
    let reactionType = "ON_CLICK";

    // Access reactions via the narrowed type
    const reactionsNode = node as FrameNode | ComponentNode | InstanceNode | GroupNode | VectorNode | TextNode;
    for (const reaction of reactionsNode.reactions) {
      // Get the trigger type
      if (reaction.trigger) {
        reactionType = reaction.trigger.type;
      }

      // Extract destination from actions
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
      reactionType,
    });
  }

  return areas;
}

/**
 * Get all top-level frames across all pages in the document.
 * These are the "screens" that can be assigned to devices.
 */
export function listAllFrames(): FrameInfo[] {
  const frames: FrameInfo[] = [];

  for (const page of figma.root.children) {
    for (const child of page.children) {
      if (child.type === "FRAME" || child.type === "COMPONENT") {
        frames.push({
          id: child.id,
          name: child.name,
          pageId: page.id,
          pageName: page.name,
          width: child.width,
          height: child.height,
        });
      }
    }
  }

  return frames;
}

/**
 * Get frame info for a specific node ID.
 */
export function getFrameById(nodeId: string): FrameInfo | null {
  const node = figma.getNodeById(nodeId);
  if (!node) return null;

  if (node.type === "FRAME" || node.type === "COMPONENT") {
    const page = findParentPage(node);
    return {
      id: node.id,
      name: node.name,
      pageId: page?.id || "",
      pageName: page?.name || "",
      width: node.width,
      height: node.height,
    };
  }

  return null;
}

/**
 * Navigate to a specific node on the canvas.
 */
export function navigateToNode(nodeId: string): boolean {
  const node = figma.getNodeById(nodeId);
  if (!node || !("absoluteBoundingBox" in node)) return false;

  const sceneNode = node as SceneNode;

  // Switch to the correct page if needed
  const page = findParentPage(node);
  if (page && figma.currentPage !== page) {
    figma.currentPage = page;
  }

  // Select the node and zoom to it
  figma.currentPage.selection = [sceneNode];
  figma.viewport.scrollAndZoomIntoView([sceneNode]);

  return true;
}

/**
 * Export a frame as a thumbnail PNG.
 * Returns a base64-encoded data URL.
 */
export async function exportThumbnail(nodeId: string): Promise<string | null> {
  const node = figma.getNodeById(nodeId);
  if (!node || !("exportAsync" in node)) return null;

  try {
    const bytes = await (node as SceneNode).exportAsync({
      format: "PNG",
      constraint: { type: "WIDTH", value: 240 },
    });

    // Convert Uint8Array to base64
    const base64 = figma.base64Encode(bytes);
    return `data:image/png;base64,${base64}`;
  } catch (e) {
    console.error("Export failed:", e);
    return null;
  }
}

/**
 * Find the parent PageNode of any node.
 */
function findParentPage(node: BaseNode): PageNode | null {
  let current: BaseNode | null = node;
  while (current) {
    if (current.type === "PAGE") return current as PageNode;
    current = current.parent;
  }
  return null;
}

/**
 * Extract the Figma file ID from the current document.
 * Note: In the Plugin API, we can get this from figma.fileKey
 */
export function getFileInfo(): { fileId: string; fileName: string } {
  return {
    fileId: figma.fileKey || "",
    fileName: figma.root.name,
  };
}
