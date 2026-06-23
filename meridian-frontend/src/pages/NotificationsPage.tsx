import { useState } from 'react';
import { Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useUiStore } from '../store/uiStore';
import { fetchNotifications } from '../services/mockApi';

const accentClass = {
  verified: 'bg-verified',
  flagged: 'bg-flagged',
  highlight: 'bg-highlight',
  muted: 'bg-muted',
};

const filterOptions = ['All', 'Unread', 'Today', 'This Week', 'Older'];

export function NotificationsPage() {
  const { data: notifications = [] } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications });
  const categories = ['All', 'Patches', 'Q&A', 'Forks', 'Payouts', 'Mentions'];
  const [activeCat, setActiveCat] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const showToast = useUiStore((s) => s.showToast);

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted">Activity center</p>
          <h2 className="mt-2 text-3xl font-black">Patch decisions, answers, forks, and payouts</h2>
        </div>
        <div className="relative">
          <button className="inline-flex h-10 items-center gap-2 rounded-full border border-black px-4 font-bold" onClick={() => setFilterOpen(!filterOpen)}>
            <Filter size={16} />
            {activeFilter}
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute right-0 top-12 z-20 w-40 rounded-lg border py-1 shadow-xl" style={{ background: '#14171c', borderColor: '#2f3336' }}>
                {filterOptions.map((opt) => (
                  <button key={opt} className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-[#1a1d24] ${activeFilter === opt ? 'font-bold' : ''}`} style={{ color: activeFilter === opt ? '#00C896' : '#e7e9ea' }} onClick={() => { setActiveFilter(opt); setFilterOpen(false); }}>
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
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
