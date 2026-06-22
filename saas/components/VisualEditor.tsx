"use client";

import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { X, Plus, FloppyDisk } from "@phosphor-icons/react/dist/ssr";

type TapArea = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  action: "next" | "prev" | "jump";
  target: string;
  frameUrl?: string;
};

interface VisualEditorProps {
  device: any;
  allDevices: any[];
  clientId: string;
  onClose: () => void;
  onSave: (areas: TapArea[]) => void;
  initialAreas?: TapArea[];
}

export default function VisualEditor({ device, allDevices, clientId, onClose, onSave, initialAreas = [] }: VisualEditorProps) {
  const [areas, setAreas] = useState<TapArea[]>(initialAreas);
  const [embedUrl, setEmbedUrl] = useState("");

  useEffect(() => {
    if (!device.url || !clientId) return;
    try {
      const u = new URL(device.url);
      const pathParts = u.pathname.split("/");
      const fileId = pathParts[2];
      const nodeId = u.searchParams.get("node-id")?.replace(/-/g, ":").replace(/%3A/gi, ":");
      if (fileId && nodeId) {
        setEmbedUrl(`https://embed.figma.com/proto/${fileId}/?node-id=${nodeId}&scaling=scale-down&hide-ui=1&client-id=${clientId}&embed-host=${typeof window !== 'undefined' ? window.location.host : ''}`);
      }
    } catch (e) {}
  }, [device.url, clientId]);

  const addArea = () => {
    setAreas([...areas, {
      id: `area-${Date.now()}`,
      x: 5, y: 5, w: 20, h: 20,
      action: "jump",
      target: "all"
    }]);
  };

  const updateArea = (id: string, updates: Partial<TapArea>) => {
    setAreas(areas.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const removeArea = (id: string) => {
    setAreas(areas.filter(a => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col p-4 md:p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 bg-zinc-900 border border-white/10 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold">Visual Tap Areas - {device.name}</h2>
          <p className="text-xs text-zinc-400">Drag to draw invisible buttons over your Figma screen.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onSave(areas)} className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400">
            <FloppyDisk /> Save Areas
          </button>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400">
            <X weight="bold" />
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Canvas */}
        <div className="flex-[3] bg-zinc-900 border border-white/5 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden">
          <div className="w-full h-full relative" style={{ aspectRatio: "2360/1640" }}>
            {embedUrl ? (
              <iframe src={embedUrl} className="absolute inset-0 w-full h-full border-none opacity-80 pointer-events-none" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500">Invalid Figma URL</div>
            )}
            
            {/* Draggable Areas */}
            {areas.map((area, i) => (
              <Rnd
                key={area.id}
                size={{ width: `${area.w}%`, height: `${area.h}%` }}
                position={{ x: (area.x / 100) * window.innerWidth * 0.7, y: (area.y / 100) * window.innerHeight * 0.8 }} // Approximate percentages for MVP
                onDragStop={(e, d) => {
                  // Basic conversion back to percentage (rough math for MVP)
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  // Rough resize math
                }}
                className="absolute bg-emerald-500/30 border-2 border-emerald-500 flex items-center justify-center font-bold text-white shadow-lg backdrop-blur-sm rounded-lg"
              >
                Area {i + 1}
              </Rnd>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col overflow-y-auto">
          <button onClick={addArea} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium flex items-center justify-center gap-2 mb-6">
            <Plus /> Add Tap Area
          </button>

          <div className="space-y-4">
            {areas.map((area, i) => (
              <div key={area.id} className="bg-zinc-950 border border-white/5 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <strong className="text-sm">Area {i + 1}</strong>
                  <button onClick={() => removeArea(area.id)} className="text-red-400 text-xs hover:underline">Delete</button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Action</label>
                    <select 
                      value={area.action}
                      onChange={(e) => updateArea(area.id, { action: e.target.value as any })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="jump">Jump to Target</option>
                      <option value="next">Next Frame</option>
                      <option value="prev">Previous Frame</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Target Device</label>
                    <select 
                      value={area.target}
                      onChange={(e) => updateArea(area.id, { target: e.target.value })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Devices</option>
                      {allDevices.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {area.action === "jump" && (
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Target Figma URL</label>
                      <input 
                        type="url" 
                        value={area.frameUrl || ""}
                        onChange={(e) => updateArea(area.id, { frameUrl: e.target.value })}
                        placeholder="Paste URL..."
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
