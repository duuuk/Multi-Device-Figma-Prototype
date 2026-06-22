"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lightning, MonitorPlay } from "@phosphor-icons/react/dist/ssr";

export default function AppDashboard() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");

  const generateRoom = () => {
    // Generate a random 4 character alphanumeric string
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    router.push(`/app/${code}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      router.push(`/app/${roomCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Lightning className="w-8 h-8 text-emerald-400" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">Sync Dashboard</h1>
          <p className="text-zinc-400 mb-8">Start a new session or join an existing one to manage your target devices.</p>

          <button 
            onClick={generateRoom}
            className="w-full h-14 rounded-full bg-emerald-500 text-zinc-950 font-bold text-lg hover:bg-emerald-400 transition-colors active:scale-95 mb-8 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            Create New Room
          </button>

          <div className="flex items-center w-full gap-4 mb-8 opacity-50">
            <div className="h-px bg-white/20 flex-1"></div>
            <span className="text-xs font-medium uppercase tracking-widest">Or join existing</span>
            <div className="h-px bg-white/20 flex-1"></div>
          </div>

          <form onSubmit={joinRoom} className="w-full flex gap-3">
            <input 
              type="text" 
              placeholder="e.g. A7B2" 
              maxLength={4}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="flex-1 h-12 bg-zinc-950 border border-white/10 rounded-xl px-4 text-center text-xl font-mono uppercase focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700"
            />
            <button 
              type="submit"
              disabled={roomCode.length !== 4}
              className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 font-semibold transition-colors"
            >
              Join
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
