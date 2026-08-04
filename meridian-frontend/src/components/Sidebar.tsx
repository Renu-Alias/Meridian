import { Bell, Compass, Edit3, Home, Settings, Trophy, User, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { BrandMark } from './Logo';
import { useUiStore } from '../store/uiStore';
import { DEFAULT_AVATAR } from '../services/adapters';

const colors = {
  border: '#2f3336',
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  activeBg: 'rgba(45,212,163,0.1)',
  activeBorder: '#2DD4A3',
};

export function Sidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const me = useUiStore((state) => state.me);

  const links = [
    { to: '/feed', label: 'Feed', icon: Home },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    ...(me?.username ? [{ to: `/profile/${me.username}`, label: 'Profile', icon: User }] : []),
    { to: '/editor/new', label: 'Write', icon: Edit3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <aside
        className={`sidebar-scroll fixed inset-y-0 left-0 z-30 flex w-[260px] shrink-0 flex-col px-4 py-6 transition-transform lg:sticky lg:top-0 lg:h-full lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#1C1B1B',
          borderRight: `1px solid ${colors.border}`,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo area */}
        <BrandMark to="/discover" showSubtitle className="px-2" />
        <button className="lg:hidden absolute right-4 top-6" aria-label="Close navigation" onClick={toggleSidebar}>
          <X size={18} style={{ color: colors.secondary }} />
        </button>

        {/* Nav links */}
        <nav className="mt-10 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex h-11 items-center gap-4 rounded-lg px-3 text-[15px] font-medium transition-all ${
                  isActive
                    ? 'border-l-[3px]'
                    : 'border-l-[3px] border-transparent hover:bg-[#1a1d24]'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? colors.primary : colors.secondary,
                borderLeftColor: isActive ? colors.activeBorder : 'transparent',
                background: isActive ? colors.activeBg : 'transparent',
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
              })}
            >
              <Icon size={19} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User area */}
        <div className="mt-auto border-t pt-5" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-3 px-2">
            <img
              src={me?.avatar_url || DEFAULT_AVATAR}
              alt={me?.display_name || 'User'}
              className="h-9 w-9 rounded-full object-cover grayscale"
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.primary }}>{me?.display_name || 'Alex Rivera'}</p>
              <p className="text-xs" style={{ color: colors.muted }}>@{me?.username || 'arivera.dev'}</p>
            </div>
          </div>
        </div>
      </aside>
      {sidebarOpen && (
        <button aria-label="Close menu overlay" className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={toggleSidebar} />
      )}
    </>
  );
}
