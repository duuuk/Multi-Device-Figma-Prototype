# 🛸 Figma Multi-Device Prototype Sync

A synchronization tool for high-fidelity physical installations (museums, showrooms, automotive mockups) using multiple iPads and a master controller. 

The main purpose of this tool is to run a prototype on multiple devices and sync them based on the input from the controller. Currently, this relies on left and right navigation broadcasts. Future updates will add hotspot capabilities (which might kill Smart Animate, but looking into it).

---

## 📖 The Architecture

This tool uses the **Figma Embed API** and **WebSockets** to synchronize the state across multiple devices without reloading the page.

- **Master Controller**: A laptop or tablet that intercepts keystrokes and broadcasts them.
- **iPad Clients**: "Dumb" terminals that listen for broadcasts and use `postMessage` to "talk" to the Figma iframe internally.
- **Node.js Server**: The central hub that relays messages between all connected devices.

---

## 🚀 Installation & Running Locally

1. **Clone and Install**:
    ```bash
    git clone https://github.com/duuuk/Multi-Device-Figma-Prototype.git
    cd Multi-Device-Figma-Prototype
    npm install
    ```

2. **Start the Hub**:
    ```bash
    npm run dev
    ```

3. **Open the Setup Dashboard**:
    Open your browser and navigate to the address shown in your terminal (usually `http://localhost:3000`). This interface will be your command center.

---

## ⚙️ Step-by-Step Setup Guide

No coding is required! You can configure everything directly through the Setup Dashboard.

### 1. Configure Figma Access
Figma requires you to register an App to use the Embed API securely. The dashboard provides step-by-step instructions for this:
1. Go to [Figma Developer Apps](https://www.figma.com/developers/api#access-tokens).
2. Create a new app and set the OAuth scope to **ONLY** `file_content:read`.
3. Add the exact **Local Network IP** (displayed dynamically on your dashboard) to the **"Allowed embed origins"**.
4. Copy the generated **Client ID** and paste it into the dashboard.

### 2. Connect Your Master Controller
The Master Controller is the device (usually a laptop) that you will use to press the arrow keys and drive the presentation.
1. In Figma, open the prototype flow you want to use.
2. Click **Share prototype** and copy the link.
3. Paste that link into the **Controller Figma URL** field on the dashboard. The File ID and Node ID will be extracted automatically!

### 3. Add Target Devices (iPads/Screens)
You can dynamically add as many target screens as you need.
1. Click **+ Add Target Device** for each screen (e.g., Left Monitor, Center Console, Right Monitor).
2. Paste the exact Figma prototype URL you want that specific screen to display. 
   *(Note: You can paste flow URLs from the same Figma file, or completely different prototype links—the tool will parse them instantly.)*
3. Adjust the **Scale Factor** (default `1.14`) to perfectly over-scan and hide Figma's default UI edges on your specific physical screens.

### 4. Deploy and Sync
Once configured, click **Deploy Links**. The dashboard will instantly generate standalone URLs and **QR Codes** for each device.
- Scan the QR code with your iPads to instantly open their specific slice of the prototype.
- Open the Master Controller link on your laptop and use the **Left/Right Arrow Keys** to control all devices in unison!

---

## ☁️ Cloud Deployment (Optional)

If you wish to use this without being on the same local Wi-Fi network:
- **DO NOT** deploy to Vercel (Vercel is serverless and does not support the persistent WebSockets required by Socket.io).
- **DO** deploy to platforms like [Render.com](https://render.com) or [Railway.app](https://railway.app), which natively support persistent Node.js instances.
- Once deployed to the cloud, simply add your new public URL (e.g., `https://my-app.onrender.com`) to Figma's "Allowed embed origins" instead of your local IP.

---

## 💎 Pro-Tips for Installations

### 1. Hide the Browser UI (PWA Mode)
To make it look like a native application on the iPad:
1. Open the generated client URL in **Safari**.
2. Tap the **Share** icon.
3. Select **"Add to Home Screen"**.
4. Launch the app from the Home Screen. It will now run in **full-screen standalone mode** with no address bar.

### 2. Perfect "Slicing"
Create Frames in Figma that match the exact resolution of your physical screens (e.g., 2360x1640 for iPad Air). Place them side-by-side in your Figma file. Use the dashboard to map each iPad to its respective frame URL.

### 3. Smart Animate Consistency
For smooth transitions, ensure your frames in Figma have **matching layer names** across all slices. If "Layer A" exists on the Left iPad but is missing or named differently on the Center iPad, the sync will feel disjointed. Smart Animate relies heavily on naming consistency!

---

## 🛠 Troubleshooting

**Local Network Discovery (The "Firewall")**
Corporate and public Wi-Fi networks often block peer-to-peer communication between devices. If your iPads cannot load the dashboard or communicate with the laptop:
- **Solution**: Use a **dedicated mobile hotspot** or a **travel router**. This ensures a clean, local network where your laptop and iPads can securely talk to each other. Remember to update the IP Address in Figma's allowed origins when you switch networks!

---

## ❤️ Support the Project
If this tool helped you build your installation, consider supporting my work:
[**Donate via Stripe**](https://buy.stripe.com/bJeaEX61vfFv8G8arCasg01)

---

## 📄 License
MIT
