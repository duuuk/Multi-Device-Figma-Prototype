"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CaretLeft, CaretRight, Lightning } from "@phosphor-icons/react/dist/ssr";

function ControllerContent() {
  const searchParams = useSearchParams();
  const room = searchParams.get("room");
  const [controllerUrl, setControllerUrl] = useState("");
  const [status, setStatus] = useState("Waiting for input...");

  useEffect(() => {
    const saved = localStorage.getItem(`figmasync-${room}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.controllerUrl) setControllerUrl(parsed.controllerUrl);
      } catch (e) {}
    }
  }, [room]);

  const triggerAction = async (direction: "next" | "prev" | "jump") => {
    if (!room) return;
    setStatus(`Broadcasted: ${direction.toUpperCase()}`);
    await fetch("/api/pusher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: `room-${room}`,
        event: "execute-action",
        data: { direction, target: "all" }
      })
    });
    setTimeout(() => setStatus("Waiting for input..."), 800);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        triggerAction("next");
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        triggerAction("prev");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [room]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col p-8">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Lightning className="text-emerald-400" /> Master Controller</h1>
          <p className="text-zinc-500 text-sm">Room: {room}</p>
        </div>
        <div className="px-6 py-3 bg-zinc-900 border border-white/5 rounded-full flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${status === 'Waiting for input...' ? 'bg-zinc-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></div>
          <span className={`font-mono text-sm uppercase tracking-widest ${status === 'Waiting for input...' ? 'text-zinc-400' : 'text-emerald-400'}`}>
            {status}
          </span>
        </div>
      </header>

      {controllerUrl && (
        <div className="flex-1 mb-8 rounded-2xl overflow-hidden border border-white/10 relative">
          <iframe src={controllerUrl} className="absolute inset-0 w-full h-full border-none" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 h-32 shrink-0">
        <button onClick={() => triggerAction("prev")} className="bg-zinc-900 border border-white/5 hover:bg-zinc-800 rounded-2xl flex items-center justify-center font-bold gap-2 text-xl active:scale-95 transition-all">
          <CaretLeft /> Previous
        </button>
        <button onClick={() => triggerAction("next")} className="bg-zinc-900 border border-white/5 hover:bg-zinc-800 rounded-2xl flex items-center justify-center font-bold gap-2 text-xl active:scale-95 transition-all">
          Next <CaretRight />
        </button>
      </div>
      <p className="text-center text-zinc-600 text-sm mt-6">You can also use the Left/Right arrow keys or a presentation clicker.</p>
    </div>
  );
}

export default function MasterController() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>}>
      <ControllerContent />
    </Suspense>
  );
}
