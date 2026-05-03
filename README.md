# 🛸 Figma Multi-Device Prototype Sync

A professional-grade synchronization tool for high-fidelity physical installations (museums, showrooms, automotive mockups) using multiple iPads and a master controller. 

This project allows you to control multiple sliced Figma prototypes across different devices simultaneously with near-instant synchronization, preserving Figma's native **Smart Animate** transitions.

---

## 📖 The Architecture

Figma prototypes usually require a hard refresh to change screens via URL, which kills animations. This tool bypasses that by using the **Figma Embed API** and **WebSockets**.

- **Master Controller**: A laptop or tablet that intercepts keystrokes and broadcasts them.
- **iPad Clients**: "Dumb" terminals that listen for broadcasts and use `postMessage` to "talk" to the Figma iframe internally.
- **Node.js Server**: The central hub that relays messages between all connected devices.

---

## 🛠 Step 1: Figma Developer Setup

To use the Embed API's secure `postMessage` features, you must register a Figma App.

1.  **Create an App**: Go to [figma.com/developers/apps](https://www.figma.com/developers/apps) and click **"Create a new app"**.
2.  **Get your Client ID**: Copy the **Client ID** generated for your app. You will need this for your URLs.
3.  **Set Scopes**: Enable the `file_read` scope (required for the app to exist).
4.  **Allowed Domains (CRITICAL)**: Figma will block your requests unless your local network origins are whitelisted. Add the following to the **"Allowed domains"** list:
    - `http://localhost:3000`
    - `http://192.168.1.15:3000` (Replace `192.168.1.15` with your actual local IP address found in the server logs).

---

## 🔗 Step 2: Preparing your Figma IDs

Every Figma prototype has two unique IDs you need:

1.  **File ID**: Found in the URL of your Figma file.
    - `figma.com/file/ABC123XYZ/My-Project` → File ID is `ABC123XYZ`.
2.  **Node ID**: The unique ID for a specific Frame.
    - Select a Frame in Figma and look at the URL: `node-id=567-890`.
    - **Important**: In this tool, replace the dash (`-`) with a colon (`:`). 
    - Example: `567-890` becomes `567:890`.

---

## 🚀 Step 3: Installation & Running

1.  **Clone and Install**:
    ```bash
    git clone https://github.com/duuuk/Multi-Device-Figma-Prototype.git
    cd Multi-Device-Figma-Prototype
    npm install
    ```

2.  **Start the Hub**:
    ```bash
    npm start
    ```
    The console will display your **Network URL** (e.g., `http://192.168.1.15:3000`). This is the address your iPads will connect to.

---

## 📱 Step 4: Connecting Devices

Both the Controller and the Clients are now powered by a **Central Configuration**. You only need to edit **`config.json`** once.

### ⚙️ The Setup (One-time)
1. Rename `config.example.json` to `config.json`.
2. Fill in your `fileId`, `clientId`, and the `nodeId` for each of your devices.

### 🕹 The Controller (Master Laptop)
Open your browser to:
`http://localhost:3000/controller.html`

- The controller will automatically load the `controller` node defined in your `config.json`.

### 📺 The Clients (iPads)
On each iPad, navigate to the universal client URL using an **ID** that matches your `config.json`:

- **iPad 1**: `http://<YOUR_IP>:3000/client.html?id=left`
- **iPad 2**: `http://<YOUR_IP>:3000/client.html?id=center`
- **iPad 3**: `http://<YOUR_IP>:3000/client.html?id=right`

---

## 💎 Pro-Tips for Installations

### 1. Adding More Devices
To add a 4th iPad:
1. Add a new entry to the `devices` object in `config.json`.
2. Open `client.html?id=new_device_name` on the iPad.
3. No code changes required!

### 2. Hide the Browser UI (PWA Mode)
To make it look like a native application on the iPad:
1. Open the client URL in **Safari**.
2. Tap the **Share** icon.
3. Select **"Add to Home Screen"**.
4. Launch the app from the Home Screen. It will now run in **full-screen standalone mode**.

### 3. Smart Animate Consistency
For smooth transitions, ensure your frames in Figma have **matching layer names** across all slices. If "Layer A" exists on the Left iPad but is missing or named differently on the Center iPad, the sync will feel disjointed. Smart Animate relies on naming consistency across the entire prototype.

---

## 🛠 Troubleshooting & Performance

### 🌐 Local Network Discovery (The "Firewall")
Corporate and public Wi-Fi networks often block peer-to-peer communication (mDNS/UPnP). If your iPads cannot reach the laptop's IP:
- **Solution**: Use a **mobile hotspot** or a **dedicated travel router**. This ensures a clean, local subnet where devices can talk freely.

### ⚡️ Hardware Minimums
Running multiple high-fidelity Figma WebGL instances (one on each device plus the server hub) can be taxing on CPU/RAM. 
- **Laptops**: A modern MacBook Pro or equivalent is recommended to prevent frame drops on the master controller.
- **iPads**: iPad Air (M1/M2) or iPad Pro models are recommended for the smoothest 60fps animations.

---

## ❤️ Support the Project
If this tool helped you build your installation, consider supporting my work:
[**Donate via Stripe**](https://buy.stripe.com/bJeaEX61vfFv8G8arCasg01)

---

## 📄 License
MIT
