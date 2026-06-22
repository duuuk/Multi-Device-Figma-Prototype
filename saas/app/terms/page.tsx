import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 font-sans p-8 md:p-16 selection:bg-emerald-500/30">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">Terms and Conditions</h1>
        <p className="text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p>Please read these terms and conditions carefully before using MultiFig.</p>
          
          <h2 className="text-2xl font-bold text-zinc-50 mt-8">1. Acceptance of Terms</h2>
          <p>By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h2 className="text-2xl font-bold text-zinc-50 mt-8">2. Use License</h2>
          <p>This service is provided "as is" and is free to use. You may use it for personal or commercial projects. However, the service may not be replicated and sold as a standalone commercial product.</p>

          <h2 className="text-2xl font-bold text-zinc-50 mt-8">3. Disclaimer</h2>
          <p>The materials on MultiFig are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

          <h2 className="text-2xl font-bold text-zinc-50 mt-8">4. Limitations</h2>
          <p>In no event shall MultiFig or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MultiFig's website.</p>
        </div>
      </div>
    </main>
  );
}
