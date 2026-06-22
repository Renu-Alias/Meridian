import { useState } from 'react';
import { Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../services/mockApi';

const accentClass = {
  verified: 'bg-verified',
  flagged: 'bg-flagged',
  highlight: 'bg-highlight',
  muted: 'bg-muted',
};

export function NotificationsPage() {
  const { data: notifications = [] } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications });
  const categories = ['All', 'Patches', 'Q&A', 'Forks', 'Payouts', 'Mentions'];
  const [activeCat, setActiveCat] = useState('All');

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted">Activity center</p>
          <h2 className="mt-2 text-3xl font-black">Patch decisions, answers, forks, and payouts</h2>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-full border border-black px-4 font-bold" onClick={() => alert('Advanced filters coming soon')}>
          <Filter size={16} />
          Filter
        </button>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 thin-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            className={`h-9 shrink-0 rounded-full px-4 text-sm font-semibold ${activeCat === category ? 'bg-[#14171C] text-white' : 'bg-surface text-neutral-600'}`}
            onClick={() => setActiveCat(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <section className="mt-6 border border-[#333] bg-[#14171C]">
        {notifications.map((notification) => (
          <article key={notification.id} className="flex gap-4 border-b border-[#333] p-5 last:border-b-0">
            <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${accentClass[notification.accent]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{notification.category}</span>
                <span className="text-sm text-muted">· {notification.time}</span>
              </div>
              <h3 className="mt-2 font-bold">{notification.title}</h3>
              <p className="mt-1 text-sm leading-6 text-neutral-600">{notification.detail}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
