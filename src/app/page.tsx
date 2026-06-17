import Link from "next/link";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { SparklesIcon } from "@/components/icons/SparklesIcon";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <InstagramIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            InstaAuto<span className="text-indigo-400">AI</span>
          </span>
        </div>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-all duration-200 border border-white/10 text-sm"
        >
          Launch Dashboard
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
          <SparklesIcon className="w-4 h-4" />
          AI-Powered Instagram Automation
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight max-w-4xl leading-tight">
          Your Instagram Posts,
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Powered by AI
          </span>
        </h1>

        <p className="mt-6 text-lg text-neutral-400 max-w-2xl leading-relaxed">
          Connect your Instagram Business Account, set your content theme, and let
          our autonomous AI pipeline research, generate, and publish daily posts
          using DeepSeek-V3 and Pollinations AI.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25"
          >
            Get Started Free
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-200 border border-white/10"
          >
            Live Demo
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            {
              title: "AI Content Research",
              desc: "DeepSeek-V3 researches trending topics matching your chosen theme daily.",
            },
            {
              title: "AI Image Generation",
              desc: "Pollinations AI creates stunning 1080x1080 visuals with no text overlay.",
            },
            {
              title: "Automated Publishing",
              desc: "Scheduled posts are published to your Instagram feed at your chosen hour.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass-card p-6 text-left"
            >
              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
