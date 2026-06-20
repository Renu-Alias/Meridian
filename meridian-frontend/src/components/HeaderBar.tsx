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

const colors = {
  border: '#2f3336',
  primary: '#e7e9ea',
  muted: '#536471',
};

export function HeaderBar() {
  const location = useLocation();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const isEditor = location.pathname.startsWith('/editor');
  const title = isEditor ? 'Write' : titles[location.pathname] ?? 'Discover';

  return (
    <header
      className="sticky top-0 z-20 flex h-12 items-center justify-between border-b px-4"
      style={{
        borderColor: colors.border,
        background: 'rgba(10,12,16,0.85)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle navigation"
          className="grid h-8 w-8 place-items-center rounded-md lg:hidden"
          style={{ border: `1px solid ${colors.border}`, color: colors.muted }}
          onClick={toggleSidebar}
        >
          <Menu size={17} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: colors.primary }}>{title}</h1>
      </div>

      <div
        className="hidden w-full max-w-[280px] items-center gap-2 rounded-full px-3 py-1.5 text-sm sm:flex"
        style={{ background: '#14171c', border: `1px solid ${colors.border}` }}
      >
        <Search size={15} style={{ color: colors.muted }} aria-hidden="true" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: colors.primary, '--tw-placeholder-color': colors.muted } as React.CSSProperties}
          placeholder={isEditor ? 'Search drafts...' : 'Search stack...'}
          aria-label="Search stack"
        />
      </div>

      <div className="flex items-center gap-1">
        <button className="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-[#1a1d24]" style={{ color: colors.muted }} aria-label="Settings">
          <Settings size={18} />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-[#1a1d24]" style={{ color: colors.muted }} aria-label="Help">
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
}
