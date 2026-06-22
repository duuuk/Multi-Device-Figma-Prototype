import Link from "next/link";
import { ArrowRight, MonitorPlay, Infinity as InfinityIcon, MagicWand, Lightning } from "@phosphor-icons/react/dist/ssr";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-20 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="font-bold text-lg tracking-tight flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
          MultiFig
        </div>
        <div className="hidden md:flex gap-8 text-sm text-zinc-400 font-medium">
          <a href="#features" className="hover:text-zinc-50 transition-colors">Features</a>
          <a href="#how" className="hover:text-zinc-50 transition-colors">How it works</a>
        </div>
        <div className="flex gap-4 items-center">
          <a href="https://buy.stripe.com/bJeaEX61vfFv8G8arCasg01" target="_blank" className="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors">
            Support the project
          </a>
          <Link href="/app" className="h-10 px-5 inline-flex items-center justify-center rounded-full bg-zinc-50 text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors active:scale-95">
            Start a Session
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono uppercase tracking-widest">
            <span>v2.0</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
            <span>Cloud Sync Engine</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] text-balance">
            Synchronize Figma across physical spaces.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-[50ch] leading-relaxed text-balance">
            A zero-code sync engine for physical installations. Drive entire screen arrays from a single master controller, directly from your browser.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Link href="/app" className="h-12 px-8 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 transition-colors active:scale-95">
              Launch Setup Dashboard
              <ArrowRight weight="bold" />
            </Link>
            <a href="#how" className="h-12 px-8 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors font-medium active:scale-95">
              View Instructions
            </a>
          </div>
        </div>

        {/* Fake interface slice representing multi-device */}
        <div className="w-full max-w-5xl mx-auto mt-24 relative z-10">
          <div className="aspect-[21/9] rounded-2xl border border-white/10 bg-zinc-900 overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 font-mono text-sm">
              [ Interactive Multi-Device Preview Graphic ]
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Platforms */}
      <section className="py-12 border-y border-white/5 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-3 font-semibold tracking-tight text-xl">
            {/* Simple Figma logo approximation */}
            <svg className="w-6 h-6" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 28.5C19 33.7467 14.7467 38 9.5 38C4.25329 38 0 33.7467 0 28.5C0 23.2533 4.25329 19 9.5 19H19V28.5Z" fill="#1ABCFE"/><path d="M0 47.5C0 52.7467 4.25329 57 9.5 57C14.7467 57 19 52.7467 19 47.5V38H9.5C4.25329 38 0 42.2533 0 47.5Z" fill="#0ACF83"/><path d="M19 0V9.5C19 14.7467 14.7467 19 9.5 19C4.25329 19 0 14.7467 0 9.5C0 4.25329 4.25329 0 9.5 0H19Z" fill="#F24E1E"/><path d="M19 9.5V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19V9.5Z" fill="#FF7262"/><path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#A259FF"/></svg>
            Figma Native
          </div>
          <div className="flex items-center gap-3 font-semibold tracking-tight text-xl">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.18 14.28c-.28.18-2.31 1.25-3.8 1.48-.68.1-1.35.03-1.84-.18-.49-.2-.93-.57-1.18-.87-.4-.48-.66-1.14-.76-1.78-.1-.65-.05-1.37.16-2.07.2-.68.55-1.36 1-1.92.54-.67 1.23-1.2 1.95-1.57.73-.37 1.52-.57 2.27-.6.76-.03 1.47.1 2.05.3.62.22 1.15.54 1.57.94.43.4.75.87.94 1.34.2.48.27.96.22 1.4-.06.45-.23.86-.48 1.22-.24.36-.56.66-.95.89z" /></svg>
            iOS & iPadOS
          </div>
          <div className="flex items-center gap-3 font-semibold tracking-tight text-xl">
            <MonitorPlay weight="fill" className="w-6 h-6" />
            Any Browser
          </div>
        </div>
      </section>

      {/* Features Bento */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Engineered for showrooms.</h2>
          <p className="text-zinc-400 text-lg max-w-2xl">No coding required. Build complex, multi-screen interactions directly on top of your live Figma designs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="md:col-span-2 bg-zinc-900 border border-white/5 rounded-3xl p-10 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
                <MagicWand className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-3">Visual Tap Area Editor</h3>
              <p className="text-zinc-400 leading-relaxed max-w-md">Draw invisible tap areas directly over your live Figma iframes. Drag, resize, and link targets without writing a single line of code.</p>
            </div>
            {/* Visual element here */}
          </div>

          {/* Feature 2 */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-10 flex flex-col relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
              <InfinityIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-3">Continuous Flow</h3>
            <p className="text-zinc-400 leading-relaxed">Devices dynamically fetch new tap areas as they navigate through Figma flows, enabling infinite prototype chaining.</p>
          </div>

          {/* Box 3: Smart Animate */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-10 flex flex-col relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
              <MagicWand className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-3">Native Smart Animate</h3>
            <p className="text-zinc-400 leading-relaxed">Preserve Figma's buttery smooth Smart Animate transitions across multiple devices.</p>
          </div>

          {/* Box 4: 100% Local Security */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-10 flex flex-col relative group md:col-span-2 lg:col-span-3">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
              <Lightning className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-3">100% Local & Secure</h3>
            <p className="text-zinc-400 leading-relaxed">
              We don't save your designs, tap areas, or links to our servers. Ever. For maximum security and GDPR compliance, all data is stored strictly in your browser's local storage and transmitted peer-to-peer.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="md:col-span-2 bg-zinc-900 border border-white/5 rounded-3xl p-10 flex flex-col relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 w-1/2">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
                <MonitorPlay className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-3">Zero Installation SaaS</h3>
              <p className="text-zinc-400 leading-relaxed max-w-md">Our new cloud engine uses persistent WebSockets to keep devices in sync globally. Just generate a room code and go.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-32 bg-zinc-900/50 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Setup in minutes.</h2>
            <p className="text-zinc-400 text-lg">No terminal, no configuration files. Just a clean browser interface.</p>
          </div>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-emerald-500 bg-zinc-950 text-emerald-400 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(16,185,129,0.2)] z-10">1</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-zinc-900 p-6 rounded-2xl border border-white/5">
                <h3 className="font-bold text-xl mb-2">Create a Sync Room</h3>
                <p className="text-zinc-400">Click 'Start a Session' to generate a secure, unique 4-digit room code for your installation.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-zinc-950 text-zinc-400 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">2</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-zinc-900 p-6 rounded-2xl border border-white/5">
                <h3 className="font-bold text-xl mb-2">Paste Figma Links</h3>
                <p className="text-zinc-400">Add the Figma prototype URLs for your Master Controller and all Target Devices (Left iPad, Right Monitor, etc).</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-zinc-950 text-zinc-400 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">3</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-zinc-900 p-6 rounded-2xl border border-white/5">
                <h3 className="font-bold text-xl mb-2">Draw Visual Tap Areas</h3>
                <p className="text-zinc-400">Use the visual editor to drag green boxes over the buttons in your Figma design and link them to target screens.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-zinc-950 text-zinc-400 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">4</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-zinc-900 p-6 rounded-2xl border border-white/5">
                <h3 className="font-bold text-xl mb-2">Scan & Go</h3>
                <p className="text-zinc-400">Deploy your links. The dashboard generates QR codes for each iPad. Scan them, save to home screen, and present.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-24 text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Ready to sync your hardware?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/app" className="h-14 px-10 inline-flex items-center justify-center rounded-full bg-emerald-500 text-zinc-950 text-lg font-bold hover:bg-emerald-400 transition-colors active:scale-95">
            Launch Setup Dashboard
          </Link>
          <a href="https://buy.stripe.com/bJeaEX61vfFv8G8arCasg01" target="_blank" className="h-14 px-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-medium hover:bg-white/10 transition-colors active:scale-95">
            Donate via Stripe
          </a>
        </div>
        <p className="mt-12 text-zinc-500 text-sm">
          Built for prototyping physical experiences. Open source and free to use.
        </p>
      </footer>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 mt-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} MultiFig. Built by Dulguun Enkhbat.
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="/license" className="hover:text-zinc-300 transition-colors">License</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
