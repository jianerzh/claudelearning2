export default function StylePreview() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-16 p-16">
      <h1 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
        Component Style Preview
      </h1>

      {/* Profile Card */}
      <div className="relative bg-zinc-900 rounded-3xl overflow-hidden p-8 w-80 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/10 pointer-events-none" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 mb-6 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/30">
            A
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">Alex Rivera</h2>
          <p className="text-violet-400 text-sm font-medium mb-4">Product Designer</p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Crafting digital experiences that feel human.
          </p>
          <div className="flex gap-6 mb-6">
            <div>
              <div className="text-white font-bold text-lg leading-none">2,400</div>
              <div className="text-zinc-500 text-xs mt-1">Followers</div>
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">180</div>
              <div className="text-zinc-500 text-xs mt-1">Following</div>
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">42</div>
              <div className="text-zinc-500 text-xs mt-1">Works</div>
            </div>
          </div>
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25">
            Follow
          </button>
        </div>
      </div>

      {/* Counter */}
      <div className="bg-zinc-900 rounded-3xl p-10 flex flex-col items-center shadow-2xl w-72">
        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-6">Counter</span>
        <div className="text-8xl font-bold tracking-tighter leading-none mb-8 bg-gradient-to-br from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          42
        </div>
        <div className="flex gap-3 w-full">
          <button className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-semibold">−</button>
          <button className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-semibold">reset</button>
          <button className="flex-1 py-3 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25">+</button>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight leading-none">Get in touch</h2>
          <p className="text-zinc-500 mt-2 text-sm">We'll get back to you within 24 hours.</p>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
          <textarea
            rows={4}
            placeholder="Your message..."
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
          />
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25">
            Send message →
          </button>
        </div>
      </div>
    </div>
  );
}
