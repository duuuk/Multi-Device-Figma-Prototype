"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Pusher from "pusher-js";

function ClientContent() {
  const searchParams = useSearchParams();
  const room = searchParams.get("room");
  const deviceId = searchParams.get("device");
  const url = searchParams.get("url");
  const clientId = process.env.NEXT_PUBLIC_FIGMA_CLIENT_ID;
  const scale = searchParams.get("scale") || "1.14";

  const [embedUrl, setEmbedUrl] = useState("");
  const [tapAreas, setTapAreas] = useState<any[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!url || !clientId) return;
    try {
      const u = new URL(url);
      const pathParts = u.pathname.split("/");
      const fileId = pathParts[2];
      const nodeId = u.searchParams.get("node-id")?.replace(/-/g, ":").replace(/%3A/gi, ":");
      if (fileId && nodeId) {
        setEmbedUrl(`https://embed.figma.com/proto/${fileId}/?node-id=${nodeId}&scaling=scale-down&hide-ui=1&client-id=${clientId}&embed-host=${typeof window !== 'undefined' ? window.location.host : ''}`);
      }
    } catch (e) {}
  }, [url, clientId]);

  useEffect(() => {
    if (!room) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe(`room-${room}`);

    // Request config when we connect
    channel.bind("pusher:subscription_succeeded", () => {
      fetch("/api/pusher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: `room-${room}`, event: "request-config", data: {} })
      });
    });

    // Receive config from Master Dashboard
    channel.bind("send-config", (payload: any) => {
      const myConfig = payload.devices?.find((d: any) => d.id === deviceId);
      if (myConfig && myConfig.areas) {
        setTapAreas(myConfig.areas);
      }
    });

    channel.bind("execute-action", (payload: any) => {
      if (payload.target !== "all" && payload.target !== deviceId) return;

      if (iframeRef.current && iframeRef.current.contentWindow) {
        if (payload.direction === "jump" && payload.frameUrl) {
          try {
            const u = new URL(payload.frameUrl);
            const nodeId = u.searchParams.get("node-id")?.replace(/-/g, ":").replace(/%3A/gi, ":");
            if (nodeId) {
              iframeRef.current.contentWindow.postMessage(
                { type: "FIGMA_ACTION", action: "NAVIGATE_TO_NODE", payload: { nodeId } },
                "*"
              );
            }
          } catch (e) {}
        } else if (payload.direction === "next" || payload.direction === "prev") {
          iframeRef.current.contentWindow.postMessage(
            { type: "FIGMA_ACTION", action: payload.direction === "next" ? "NEXT_FRAME" : "PREVIOUS_FRAME" },
            "*"
          );
        }
      }
    });

    return () => pusher.disconnect();
  }, [room, deviceId]);

  const triggerAction = async (area: any) => {
    // If it targets this device directly, we can execute locally to save latency
    if (area.target === "self" || area.target === deviceId) {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        if (area.action === "jump" && area.frameUrl) {
          const u = new URL(area.frameUrl);
          const nodeId = u.searchParams.get("node-id")?.replace(/-/g, ":").replace(/%3A/gi, ":");
          iframeRef.current.contentWindow.postMessage({ type: "FIGMA_ACTION", action: "NAVIGATE_TO_NODE", payload: { nodeId } }, "*");
        } else {
          iframeRef.current.contentWindow.postMessage({ type: "FIGMA_ACTION", action: area.action === "next" ? "NEXT_FRAME" : "PREVIOUS_FRAME" }, "*");
        }
      }
      return;
    }

    // Otherwise broadcast it to all or specific target
    await fetch("/api/pusher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: `room-${room}`,
        event: "execute-action",
        data: { direction: area.action, target: area.target, frameUrl: area.frameUrl }
      })
    });
  };

  if (!url || !clientId) {
    return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Missing URL or Client ID</div>;
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
      <div 
        style={{ 
          width: `${100 / parseFloat(scale)}%`, 
          height: `${100 / parseFloat(scale)}%`, 
          transform: `scale(${scale})`, 
          transformOrigin: "center center",
          position: "relative"
        }}
      >
        {embedUrl && (
          <iframe 
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full border-none"
            allowFullScreen
          />
        )}
        
        {/* Render Tap Areas */}
        {tapAreas.map((area) => (
          <div 
            key={area.id}
            onClick={() => triggerAction(area)}
            style={{
              position: "absolute",
              left: `${area.x}%`,
              top: `${area.y}%`,
              width: `${area.w}%`,
              height: `${area.h}%`,
              cursor: "pointer",
              zIndex: 50
              // background: "rgba(255,0,0,0.2)" // Uncomment to debug hitboxes
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function TargetDeviceView() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">Loading...</div>}>
      <ClientContent />
    </Suspense>
  );
}
