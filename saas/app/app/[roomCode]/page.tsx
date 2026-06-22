"use client";

import { use, useEffect, useRef, useState } from "react";
import { Copy, Plus, DeviceTablet, MagicWand, Lightning, QrCode, Keyboard, X } from "@phosphor-icons/react/dist/ssr";
import Pusher from "pusher-js";
import { QRCodeSVG } from "qrcode.react";
import VisualEditor from "../../../components/VisualEditor";

export default function RoomDashboard({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode } = use(params);
  
  const [isMounted, setIsMounted] = useState(false);
  const [controllerUrl, setControllerUrl] = useState("");
  const [devices, setDevices] = useState([{ id: "target-1", name: "Main Display", url: "", scale: "1.14" }]);
  
  // Modals
  const [showDeploy, setShowDeploy] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [activeEditorDevice, setActiveEditorDevice] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Load from LocalStorage
    const saved = localStorage.getItem(`figmasync-${roomCode}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.controllerUrl) setControllerUrl(parsed.controllerUrl);
        if (parsed.devices) setDevices(parsed.devices);
      } catch (e) {}
    }
  }, [roomCode]);

  useEffect(() => {
    if (!isMounted) return;
    // Save to LocalStorage whenever things change
    localStorage.setItem(`figmasync-${roomCode}`, JSON.stringify({ controllerUrl, devices }));
  }, [controllerUrl, devices, roomCode, isMounted]);

  const devicesRef = useRef(devices);
  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  useEffect(() => {
    if (!isMounted) return;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe(`room-${roomCode}`);
    
    channel.bind("request-config", () => {
      fetch("/api/pusher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: `room-${roomCode}`,
          event: "send-config",
          data: { devices: devicesRef.current }
        })
      });
    });

    return () => pusher.disconnect();
  }, [roomCode, isMounted]);

  const addDevice = () => {
    setDevices([...devices, { id: `target-${devices.length + 1}`, name: `Display ${devices.length + 1}`, url: "", scale: "1.14" }]);
  };

  const updateDevice = (index: number, field: string, value: string) => {
    const newDevices = [...devices];
    newDevices[index] = { ...newDevices[index], [field]: value };
    setDevices(newDevices);
  };

  const removeDevice = (index: number) => {
    const newDevices = [...devices];
    newDevices.splice(index, 1);
    setDevices(newDevices);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getClientLink = (device: any) => {
    if (!isMounted) return "";
    return `${window.location.origin}/client?room=${roomCode}&device=${device.id}&url=${encodeURIComponent(device.url)}&scale=${device.scale}`;
  };
  
  const getControllerLink = () => {
    if (!isMounted) return "";
    return `${window.location.origin}/controller?room=${roomCode}`;
  };

  if (!isMounted) return null; // Avoid hydration mismatch entirely

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans p-6 md:p-12 pb-32">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Room: {roomCode}</h1>
            <p className="text-zinc-400">Configure your multi-device sync setup (Saved locally)</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
              Sync Engine Active
            </div>
            <button 
              onClick={() => setShowDeploy(true)}
              className="px-6 py-2 bg-zinc-50 text-zinc-950 hover:bg-zinc-200 rounded-full text-sm font-bold transition-colors"
            >
              Deploy Links
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Settings Column */}
          <div className="space-y-8">
            <section className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Lightning className="text-emerald-400" /> Security Notice
              </h2>
              <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                <p>This session is peer-to-peer.</p>
                <p>Your configuration is saved strictly to your local browser storage. We do not store your data on our servers.</p>
              </div>
            </section>

            <section className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DeviceTablet className="text-emerald-400" /> Master Controller
              </h2>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Controller Figma URL (Optional)</label>
                <input 
                  type="url" 
                  value={controllerUrl}
                  onChange={(e) => setControllerUrl(e.target.value)}
                  placeholder="Paste prototype link..." 
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <button 
                onClick={() => window.open(getControllerLink(), "_blank")}
                className="w-full mt-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-medium transition-colors text-sm flex justify-center items-center gap-2"
              >
                Open Master Controller
              </button>
            </section>
            
            <section className="bg-zinc-900 border border-white/5 rounded-2xl p-6 opacity-50 pointer-events-none">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Keyboard className="text-zinc-400" /> Keybindings (Soon)
              </h2>
              <p className="text-xs text-zinc-400 mb-4">Map custom keys to specific Figma frames.</p>
              <button className="w-full py-2 border border-white/10 rounded-xl text-xs">Add Binding</button>
            </section>
          </div>

          {/* Targets Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Target Devices</h2>
              <button onClick={addDevice} className="flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                <Plus /> Add Device
              </button>
            </div>

            {devices.map((device, i) => (
              <div key={i} className="bg-zinc-900 border border-white/5 rounded-2xl p-6 relative group">
                <button onClick={() => removeDevice(i)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                  <X />
                </button>
                <div className="flex items-center justify-between mb-4 pr-6">
                  <input 
                    type="text" 
                    value={device.name}
                    onChange={(e) => updateDevice(i, 'name', e.target.value)}
                    className="bg-transparent border-none text-lg font-bold focus:outline-none focus:border-b focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Figma URL</label>
                    <input 
                      type="url" 
                      value={device.url}
                      onChange={(e) => updateDevice(i, 'url', e.target.value)}
                      placeholder="Paste specific screen link..." 
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Scale</label>
                    <input 
                      type="text" 
                      value={device.scale}
                      onChange={(e) => updateDevice(i, 'scale', e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-center"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => copyToClipboard(getClientLink(device), device.id)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy /> {copiedLink === device.id ? "Copied!" : "Copy Link"}
                  </button>
                  <button 
                    onClick={() => setActiveEditorDevice(i)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MagicWand /> Visual Editor
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {activeEditorDevice !== null && (
        <VisualEditor 
          device={devices[activeEditorDevice]} 
          allDevices={devices}
          clientId={process.env.NEXT_PUBLIC_FIGMA_CLIENT_ID || ""}
          initialAreas={(devices[activeEditorDevice] as any).areas || []}
          onSave={(areas) => {
            updateDevice(activeEditorDevice, 'areas', areas as any);
            setActiveEditorDevice(null);
          }}
          onClose={() => setActiveEditorDevice(null)} 
        />
      )}

      {/* Deploy Modal */}
      {showDeploy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Deploy Links</h2>
              <button onClick={() => setShowDeploy(false)} className="text-zinc-500 hover:text-white p-2 bg-white/5 rounded-full"><X weight="bold" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Controller Link */}
              <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
                <h3 className="font-bold mb-1">Master Controller</h3>
                <p className="text-xs text-zinc-400 mb-6">Open this on your laptop</p>
                <div className="bg-white p-4 rounded-xl mb-6">
                  <QRCodeSVG value={getControllerLink()} size={140} />
                </div>
                <button 
                  onClick={() => window.open(getControllerLink(), "_blank")}
                  className="w-full py-2 bg-emerald-500 text-black font-bold rounded-xl text-sm hover:bg-emerald-400"
                >
                  Open Controller
                </button>
              </div>

              {/* Target Links */}
              {devices.map((device, i) => (
                <div key={i} className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
                  <h3 className="font-bold mb-1">{device.name}</h3>
                  <p className="text-xs text-zinc-400 mb-6">Scan with Target iPad</p>
                  <div className="bg-white p-4 rounded-xl mb-6">
                    <QRCodeSVG value={getClientLink(device)} size={140} />
                  </div>
                  <button 
                    onClick={() => copyToClipboard(getClientLink(device), `modal-${device.id}`)}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl text-sm"
                  >
                    {copiedLink === `modal-${device.id}` ? "Copied!" : "Copy URL"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
