import Link from "next/link";

export default function License() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 font-sans p-8 md:p-16 selection:bg-emerald-500/30">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">MIT License</h1>
        
        <div className="space-y-6 text-zinc-300 leading-relaxed font-mono text-sm bg-zinc-900 p-8 border border-white/5 rounded-2xl">
          <p>Copyright (c) {new Date().getFullYear()} Dulguun Enkhbat</p>
          <p>Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:</p>
          <p>The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.</p>
          <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</p>
        </div>
      </div>
    </main>
  );
}
