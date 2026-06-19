import { HelpCircle, Menu, Search, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';

const titles: Record<string, string> = {
  '/feed': 'Feed',
  '/discover': 'Discover',
  '/notifications': 'Notifications',
  '/wallet': 'Wallet',
  '/profile/alex': 'Profile',
  '/settings': 'Settings',
  '/mentored': 'Mentored Track',
};

export function HeaderBar() {
  const location = useLocation();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const isEditor = location.pathname.startsWith('/editor');
  const title = isEditor ? 'Write' : titles[location.pathname] ?? 'Discover';

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-surface bg-white/95 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle navigation"
          className="grid h-9 w-9 place-items-center border border-surface text-muted lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu size={18} />
        </button>
        <h1 className="text-xl font-bold tracking-normal text-ink">{title}</h1>
      </div>

      <div className="hidden w-full max-w-[300px] items-center gap-2 rounded-full border border-surface bg-surface/70 px-3 py-2 text-sm sm:flex">
        <Search size={16} className="text-muted" aria-hidden="true" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          placeholder={isEditor ? 'Search drafts...' : 'Search stack...'}
          aria-label="Search stack"
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="grid h-9 w-9 place-items-center text-muted hover:text-ink" aria-label="Settings">
          <Settings size={20} />
        </button>
        <button className="grid h-9 w-9 place-items-center text-muted hover:text-ink" aria-label="Help">
          <HelpCircle size={20} />
        </button>
      </div>
    </header>
  );
}
