import { Bell, Compass, Edit3, Home, Settings, User, WalletCards, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import { Logo } from './Logo';

const links = [
  { to: '/feed', label: 'Feed', icon: Home },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/wallet', label: 'Wallet', icon: WalletCards },
  { to: '/profile/alex', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const colors = {
  border: '#2f3336',
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  activeBg: 'rgba(0,200,150,0.1)',
  activeBorder: '#00C896',
};

export function Sidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col px-4 py-6 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#1C1B1B',
          borderRight: `1px solid ${colors.border}`,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo area */}
        <NavLink to="/" className="flex items-center gap-3 px-2">
          <Logo />
          <span>
            <span className="block text-xl font-bold leading-none" style={{ color: colors.primary }}>Meridian</span>
            <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: colors.muted }}>Engineer Network</span>
          </span>
        </NavLink>
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
              })}
            >
              <Icon size={19} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Write button */}
        <NavLink
          to="/editor/new"
          className="mt-6 inline-flex h-10 w-full max-w-[180px] items-center justify-center gap-2 self-start rounded-full text-sm font-bold transition-all hover:brightness-110"
          style={{ background: colors.activeBorder, color: '#000' }}
        >
          <Edit3 size={15} aria-hidden="true" />
          Write
        </NavLink>

        {/* User area */}
        <div className="mt-auto border-t pt-5" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-3 px-2">
            <img
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80"
              alt="Alex Rivera"
              className="h-9 w-9 rounded-full object-cover grayscale"
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.primary }}>Alex Rivera</p>
              <p className="text-xs" style={{ color: colors.muted }}>@arivera.dev</p>
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
