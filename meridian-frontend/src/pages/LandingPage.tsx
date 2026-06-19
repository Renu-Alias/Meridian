import { ArrowRight, GitFork, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedNetwork } from '../components/AnimatedNetwork';

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <AnimatedNetwork />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(0,200,150,0.18),transparent_32%),linear-gradient(90deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.26)_100%)]" />

      <nav className="relative z-10 flex h-16 items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center bg-white">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
          </span>
          <span className="text-xl font-bold">Meridian</span>
        </Link>
        <Link to="/discover" className="hidden text-sm font-semibold text-white/80 hover:text-white sm:inline">
          Open app
        </Link>
      </nav>

      <section className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center px-5 pb-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="animate-fadeUp font-mono text-xs uppercase tracking-[0.36em] text-verified">Knowledge unfolding. Impact rippling.</p>
          <h1 className="mt-5 animate-fadeUp text-5xl font-black leading-[0.95] text-white sm:text-7xl lg:text-8xl" style={{ animationDelay: '120ms' }}>
            Meridian
          </h1>
          <p className="mt-6 max-w-2xl animate-fadeUp text-xl leading-8 text-white/75 sm:text-2xl" style={{ animationDelay: '240ms' }}>
            A peer-driven engineering writing network where posts find the right stack, claims carry proof, and useful ideas keep earning credit.
          </p>

          <div className="mt-10 flex animate-fadeUp flex-col gap-3 sm:flex-row" style={{ animationDelay: '360ms' }}>
            <Link
              to="/discover"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-verified px-7 font-bold text-black shadow-glow transition hover:scale-[1.02]"
            >
              Join Meridian
              <ArrowRight size={18} />
            </Link>
            <a
              href="#signals"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-7 font-bold text-white transition hover:border-white hover:bg-white/10"
            >
              Learn More
            </a>
          </div>

          <div id="signals" className="mt-16 grid animate-fadeUp gap-3 sm:grid-cols-3" style={{ animationDelay: '480ms' }}>
            {[
              [ShieldCheck, 'Verified claims', 'Inline citations and community flags keep trust visible.'],
              [GitFork, 'Living posts', 'Patch, fork, and merge knowledge with attribution intact.'],
              [Sparkles, 'Impact pay', 'Writers earn when work is bookmarked, shared, or used.'],
            ].map(([Icon, title, copy]) => (
              <article key={String(title)} className="border border-white/15 bg-white/5 p-4 backdrop-blur">
                <Icon size={22} className="text-verified" />
                <h2 className="mt-4 font-bold">{title as string}</h2>
                <p className="mt-2 text-sm leading-6 text-white/65">{copy as string}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
