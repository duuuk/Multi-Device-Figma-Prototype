const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 3000;
const CONFIG_FILE = path.join(__dirname, "configs.json");

let nodeConfigs = {};
let keyBindings = [];  // Array of { key, label, frameMappings: [{ device, frameUrl }] }

if (fs.existsSync(CONFIG_FILE)) {
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    // Separate key bindings from node configs
    if (raw.__keyBindings) {
      keyBindings = raw.__keyBindings;
      delete raw.__keyBindings;
    }
    nodeConfigs = raw;
  } catch (e) {
    console.error("Error reading configs.json", e);
  }
}

function persistConfigs() {
  const data = { ...nodeConfigs, __keyBindings: keyBindings };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

// ── Serve static files from /public ──────────────────────────────────
app.use(express.static("public"));

// ── API endpoint for frontend to get local network IP ───────────────
app.get("/api/network", (req, res) => {
  const ips = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  res.json({ ips });
});

// ── Socket.io routing ────────────────────────────────────────────────
io.on("connection", (socket) => {
  const addr = socket.handshake.address;
  console.log(`[+] Client connected: ${socket.id} (${addr})`);

  // Push live client count to all on connect
  io.emit("clients-count", io.engine.clientsCount);

  // Controller or Client sends 'trigger-action' → broadcast 'execute-action'

  socket.on("save-config", ({ nodeId, areas }) => {
    if (nodeId) {
      nodeConfigs[nodeId] = areas;
      persistConfigs();
      console.log(`[+] Saved ${areas.length} areas for node ${nodeId}`);
      // Broadcast to any clients currently on this node
      io.emit("config-updated", { nodeId, areas });
    }
  });

  // ── Key Bindings ─────────────────────────────────────────────────
  socket.on("save-key-bindings", (bindings) => {
    keyBindings = bindings || [];
    persistConfigs();
    console.log(`[⌨] Saved ${keyBindings.length} key bindings`);
    // Broadcast updated bindings to all controllers
    io.emit("key-bindings-updated", keyBindings);
  });

  socket.on("get-key-bindings", (callback) => {
    if (callback) callback(keyBindings);
  });

  socket.on("get-config", (nodeId, callback) => {
    if (callback) callback(nodeConfigs[nodeId] || []);
  });

  socket.on("trigger-action", (payload) => {
    const dir = payload?.direction || "next";
    const target = payload?.target || "all";
    console.log(`[→] trigger-action received from ${socket.id}: ${dir} (target: ${target})`);

    // Broadcast to EVERY connected client
    io.emit("execute-action", payload);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[−] Client disconnected: ${socket.id} (${reason})`);
    // Push updated client count on disconnect
    io.emit("clients-count", io.engine.clientsCount - 1);
  });
});

// ── Start server & print local network addresses ─────────────────────
server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  Multi-Device Figma Sync Server`);
  console.log(`══════════════════════════════════════════════════`);
  console.log(`  Local:   http://localhost:${PORT}`);

  // Print every IPv4 address on the LAN
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        console.log(`  Network: http://${iface.address}:${PORT}`);
      }
    }
  }

  console.log(`\n  Controller: http://<IP>:${PORT}/controller.html`);
  console.log(`  Clients:    http://<IP>:${PORT}/client.html`);
  console.log(`══════════════════════════════════════════════════\n`);
});
