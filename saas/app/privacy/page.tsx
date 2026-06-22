import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 font-sans p-8 md:p-16 selection:bg-emerald-500/30">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p>At MultiFig, we take your privacy extremely seriously. We have designed our service so that we do not process, store, or have access to any of your Figma designs, tap area configurations, or synchronization data on our servers.</p>
          
          <h2 className="text-2xl font-bold text-zinc-50 mt-8">1. Information We Collect</h2>
          <p>We do not collect any personal data, analytics, or Figma data. All configuration data (like your Figma URLs, Client IDs, and Tap Areas) is stored exclusively in your browser's local storage (`localStorage`).</p>
          
          <h2 className="text-2xl font-bold text-zinc-50 mt-8">2. How Sync Works</h2>
          <p>MultiFig uses Pusher (a real-time WebSocket service) to broadcast navigation signals (e.g., "go to next frame") between your devices. These signals are transient and are not logged or stored by our application.</p>

          <h2 className="text-2xl font-bold text-zinc-50 mt-8">3. GDPR & EU Regulations</h2>
          <p>Because we do not collect, process, or store any Personally Identifiable Information (PII), our service is inherently compliant with the General Data Protection Regulation (GDPR) and other EU privacy laws. Your data remains on your physical devices.</p>

          <h2 className="text-2xl font-bold text-zinc-50 mt-8">4. Changes</h2>
          <p>We may update this Privacy Policy from time to time. Since we collect no email addresses, you must review this page periodically for any changes.</p>
        </div>
      </div>
    </main>
  );
}
