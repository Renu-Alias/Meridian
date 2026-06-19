import { Flame, MessageSquare, Repeat2, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../components/Badge';
import { fetchDiscover } from '../services/mockApi';

export function DiscoverPage() {
  const { data } = useQuery({ queryKey: ['discover'], queryFn: fetchDiscover });
  if (!data) return <div className="p-8">Loading discovery graph...</div>;

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.36em] text-emerald-700">Algorithm Active</p>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <h2 className="text-4xl font-black">Stack-Matched for You</h2>
        <span className="rounded-full bg-verified px-5 py-2 font-mono text-xs">Go · Kubernetes</span>
        <span className="rounded-full bg-surface px-5 py-2 font-mono text-xs text-neutral-500">Distributed Systems</span>
      </div>

      <article className="mt-8 border border-surface bg-white p-5">
        <div className="flex gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-surface font-mono text-lg">λ</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3">
              <div>
                <h3 className="text-xl font-bold">{data.featured.title}</h3>
                <p className="text-sm text-neutral-500">By {data.featured.handle} · {data.featured.age}</p>
              </div>
              <div className="ml-auto"><Badge status="verified" label="Verified Claim" /></div>
            </div>
            <p className="mt-5 max-w-3xl text-lg leading-8">{data.featured.excerpt}</p>
            <div className="mt-5 flex gap-8 border-t border-surface pt-5 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-2"><Repeat2 size={18} />1.2k Impact Ripples</span>
              <span className="inline-flex items-center gap-2"><MessageSquare size={18} />84 Comments</span>
            </div>
          </div>
        </div>
      </article>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {data.cards.map((card) => (
          <article key={card.title} className="border border-surface bg-white p-4">
            <img src={card.image} alt="" className="h-40 w-full object-cover grayscale" />
            <h3 className="mt-5 text-lg font-bold">{card.title}</h3>
            <p className="mt-4 text-sm text-emerald-700">{card.status}</p>
            <div className="mt-8 flex items-center justify-between">
              <span className="font-mono text-sm text-neutral-500">{card.ripples} Ripples</span>
              <button className="font-bold">Read More</button>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="flex items-center gap-3 text-3xl font-bold"><Flame size={25} />Trending Patches</h2>
        <div className="mt-6 space-y-3">
          {data.trending.map(([title, growth], index) => (
            <article key={title} className="flex items-center gap-5 border border-surface bg-white p-5">
              <span className="text-3xl font-bold text-neutral-300">{String(index + 1).padStart(2, '0')}</span>
              <div className="flex-1">
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-neutral-500">Patched by @security_lead · {index ? '8.4k' : '12k'} forks in 2 hours</p>
              </div>
              <span className="flex items-center gap-1 font-mono text-sm text-emerald-700">{growth}<TrendingUp size={18} /></span>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Find a Mentor</h2>
          <button className="font-bold">View All Experts</button>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {data.mentors.map(([name, role, tagA, tagB]) => (
            <article key={name} className="border border-surface bg-white p-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-black" />
              <h3 className="mt-4 font-bold">{name}</h3>
              <p className="text-sm text-muted">{role}</p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="rounded-full bg-surface px-2 py-1 text-xs">{tagA}</span>
                <span className="rounded-full bg-surface px-2 py-1 text-xs">{tagB}</span>
              </div>
              <button className="mt-5 h-10 w-full rounded-full border border-black font-bold hover:bg-black hover:text-white">Connect</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
