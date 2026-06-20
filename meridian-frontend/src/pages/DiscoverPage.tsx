import { Flame, MessageSquare, Repeat2, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../components/Badge';
import { fetchDiscover } from '../services/mockApi';

export function DiscoverPage() {
  const { data } = useQuery({ queryKey: ['discover'], queryFn: fetchDiscover });
  if (!data) return <div className="p-8">Loading discovery graph...</div>;

  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-6">
      <p className="font-mono text-xs uppercase tracking-[0.36em] text-emerald-700">Algorithm Active</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="text-4xl font-black">Stack-Matched for You</h2>
        <span className="rounded-full bg-verified px-4 py-1.5 font-mono text-xs">Go · Kubernetes</span>
        <span className="rounded-full bg-surface px-4 py-1.5 font-mono text-xs text-neutral-500">Distributed Systems</span>
      </div>

      <article className="x-post-font mt-6 border border-[#333] bg-black p-4">
        <div className="flex gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface font-mono text-lg">λ</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-[17px] font-bold leading-6 text-[#0f1419]">{data.featured.title}</h3>
                <p className="text-[14px] leading-5 text-[#536471]">By {data.featured.handle} · {data.featured.age}</p>
              </div>
              <Badge status="verified" label="Verified Claim" />
            </div>
            <p className="x-post-body mt-2 max-w-3xl text-[#0f1419]">{data.featured.excerpt}</p>
            <div className="mt-3 flex gap-6 border-t border-[#333] pt-3 text-[13px] text-[#536471]">
              <span className="inline-flex items-center gap-2"><Repeat2 size={18} />1.2k Impact Ripples</span>
              <span className="inline-flex items-center gap-2"><MessageSquare size={18} />84 Comments</span>
            </div>
          </div>
        </div>
      </article>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {data.cards.map((card) => (
          <article key={card.title} className="x-post-font border border-[#333] bg-black p-3">
            <img src={card.image} alt="" className="h-36 w-full object-cover grayscale" />
            <h3 className="mt-3 text-[16px] font-bold leading-6 text-[#0f1419]">{card.title}</h3>
            <p className="mt-2 text-[13px] text-emerald-700">{card.status}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-500">{card.ripples} Ripples</span>
              <button className="text-[14px] font-bold">Read More</button>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="flex items-center gap-3 text-3xl font-bold"><Flame size={25} />Trending Patches</h2>
        <div className="mt-4 space-y-2">
          {data.trending.map(([title, growth], index) => (
            <article key={title} className="x-post-font flex items-center gap-4 border border-[#333] bg-black p-4">
              <span className="text-2xl font-bold text-neutral-300">{String(index + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-bold text-[#0f1419]">{title}</h3>
                <p className="text-[13px] text-[#536471]">Patched by @security_lead · {index ? '8.4k' : '12k'} forks in 2 hours</p>
              </div>
              <span className="flex items-center gap-1 font-mono text-sm text-emerald-700">{growth}<TrendingUp size={18} /></span>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Find a Mentor</h2>
          <button className="font-bold">View All Experts</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {data.mentors.map(([name, role, tagA, tagB]) => (
            <article key={name} className="border border-[#333] bg-black p-5 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-black" />
              <h3 className="mt-3 font-bold">{name}</h3>
              <p className="text-sm text-muted">{role}</p>
              <div className="mt-3 flex justify-center gap-2">
                <span className="rounded-full bg-surface px-2 py-1 text-xs">{tagA}</span>
                <span className="rounded-full bg-surface px-2 py-1 text-xs">{tagB}</span>
              </div>
              <button className="mt-4 h-10 w-full rounded-full border border-black font-bold hover:bg-black hover:text-white">Connect</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
