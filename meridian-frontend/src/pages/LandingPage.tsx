import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bookmark, Code2, Coins, GitFork, GraduationCap, Layers, MessageSquare, Repeat2, Search, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedNetwork } from '../components/AnimatedNetwork';
import { Logo } from '../components/Logo';

function useReveal(threshold = 0.18) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
}

function FloatingMetric({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div
      className="animate-fadeUp rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-2xl font-black text-verified">{value}</p>
      <p className="mt-1 text-sm text-white/60">{label}</p>
    </div>
  );
}

const features = [
  {
    icon: Search,
    title: 'Stack-Matched Discovery',
    body: 'Every post is algorithmically matched to the right engineering stack — Go, Rust, Kubernetes, eBPF, and more. No noise, just signal.',
    stats: ['12+ stacks', '98% relevance'],
  },
  {
    icon: ShieldCheck,
    title: 'Verified Claims',
    body: 'Inline citations and community verification ensure claims carry proof. Flagged content is transparently marked until resolved.',
    stats: ['94% verified', '2.1s avg. resolve'],
  },
  {
    icon: GitFork,
    title: 'Living Posts',
    body: 'Patch, fork, and merge knowledge like code. Attribution chains preserve credit across every revision and derivative work.',
    stats: ['45k forks', '100% attribution'],
  },
  {
    icon: Coins,
    title: 'Impact-Backed Earning',
    body: 'Writers earn when their work is bookmarked, shared, forked, or cited. Your impact is your income — transparently on-chain.',
    stats: ['$3400+ paid', '18k reactions'],
  },
  {
    icon: Users,
    title: 'Mentor Network',
    body: 'Get matched with distinguished engineers who review your work, suggest improvements, and fast-track your growth.',
    stats: ['200+ mentors', '4.9 avg. rating'],
  },
  {
    icon: TrendingUp,
    title: 'Trending Intelligence',
    body: 'Real-time trending patches and vulnerability hotfixes. Know what the community is rallying behind, before it hits production.',
    stats: ['Real-time', '2.4k% spikes'],
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[number]; index: number }) {
  const { ref, visible } = useReveal(0.1);
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`group rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm transition-all duration-700 ease-out hover:border-verified/30 hover:bg-white/[0.06] ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-verified/10 text-verified ring-1 ring-verified/20 transition group-hover:bg-verified/20">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
      <p className="mt-3 leading-relaxed text-white/60">{feature.body}</p>
      <div className="mt-5 flex gap-3">
        {feature.stats.map((stat) => (
          <span key={stat} className="rounded-full bg-white/5 px-3 py-1 font-mono text-xs text-white/50 ring-1 ring-white/10">
            {stat}
          </span>
        ))}
      </div>
    </div>
  );
}

function TestimonialTicker() {
  const { ref, visible } = useReveal(0.2);
  const testimonials = [
    { text: 'Meridian changed how our team consumes engineering knowledge.', author: '— Sarah Chen, Principal Systems Engineer' },
    { text: 'The stack matching is incredible. I find relevant posts in seconds.', author: '— Marcus Thorne, Staff Platform Engineer' },
    { text: 'Finally, a platform that rewards actual engineering impact.', author: '— Lyn Park, Backend Engineer' },
  ];

  return (
    <div ref={ref} className={`overflow-hidden transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="animate-scroll inline-flex gap-6">
        {[...testimonials, ...testimonials].map((t, i) => (
          <div
            key={i}
            className="flex w-[420px] shrink-0 flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
          >
            <p className="leading-relaxed text-white/70">&ldquo;{t.text}&rdquo;</p>
            <p className="text-sm text-white/40">{t.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <AnimatedNetwork />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(0,200,150,0.18),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.3)_100%)]" />

      <nav className="relative z-10 flex h-16 items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="text-xl font-bold">Meridian</span>
        </Link>
        <Link to="/discover" className="hidden text-sm font-semibold text-white/80 hover:text-white sm:inline">
          Open app
        </Link>
      </nav>

      <section className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center px-5 pb-32 pt-12 sm:px-8 lg:px-12">
        <div className="w-full max-w-3xl">
          <p className="animate-fadeUp font-mono text-xs uppercase tracking-[0.36em] text-verified">
            Knowledge unfolding. Impact rippling.
          </p>
          <h1 className="mt-5 animate-fadeUp text-5xl font-black leading-[0.95] text-white sm:text-7xl lg:text-8xl" style={{ animationDelay: '120ms' }}>
            Where code
            <br />
            meets <span className="text-verified">credibility</span>.
          </h1>
          <p className="mt-6 max-w-2xl animate-fadeUp text-xl leading-8 text-white/70 sm:text-2xl" style={{ animationDelay: '240ms' }}>
            A peer-driven engineering writing network where posts find the right stack, claims carry proof, and useful ideas keep earning.
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
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-7 font-bold text-white transition hover:border-white hover:bg-white/10"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-16 grid animate-fadeUp gap-3 sm:grid-cols-3" style={{ animationDelay: '480ms' }}>
            <FloatingMetric label="Active Engineers" value="12.4k" delay={0} />
            <FloatingMetric label="Posts Published" value="8.2k" delay={150} />
            <FloatingMetric label="Impact Paid" value="$86k" delay={300} />
          </div>

          <RevealSection className="mt-20">
            <TestimonialTicker />
          </RevealSection>
        </div>
      </section>

      <section id="features" className="relative z-10 border-t border-white/10 px-5 py-28 sm:px-8 lg:px-12">
        <RevealSection>
          <p className="font-mono text-xs uppercase tracking-[0.36em] text-verified">Platform capabilities</p>
          <h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">
            Everything a modern
            <br />
            engineering writer needs.
          </h2>
        </RevealSection>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10 px-5 py-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <RevealSection>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-8 sm:p-12">
              <p className="font-mono text-xs uppercase tracking-[0.36em] text-verified">Get started</p>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                Ready to make your knowledge count?
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/60">
                Join thousands of engineers publishing, reviewing, and earning on the network that treats knowledge like infrastructure.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/discover"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-verified px-7 font-bold text-black shadow-glow transition hover:scale-[1.02]"
                >
                  Create your first post
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-7 font-bold text-white transition hover:border-white hover:bg-white/10"
                >
                  Learn more
                </a>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-sm font-bold text-white/60">Meridian &mdash; Knowledge unfolding. Impact rippling.</span>
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <Link to="/discover" className="hover:text-white/80">Discover</Link>
            <a href="#features" className="hover:text-white/80">Features</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
