import { Bell, Compass, Edit3, Home, User, WalletCards, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import { Logo } from './Logo';

const links = [
  { to: '/feed', label: 'Feed', icon: Home },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/wallet', label: 'Wallet', icon: WalletCards },
  { to: '/profile/alex', label: 'Profile', icon: User },
];

export function Sidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col border-r border-surface bg-white px-4 py-8 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <Logo />
            <span>
              <span className="block text-2xl font-bold leading-none">Meridian</span>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.32em] text-muted">Engineer Network</span>
            </span>
          </NavLink>
          <button className="lg:hidden" aria-label="Close navigation" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className="mt-16 space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex h-12 items-center gap-4 rounded-md px-4 text-base font-medium ${
                  isActive ? 'bg-surface text-ink' : 'text-neutral-500 hover:bg-surface/60 hover:text-ink'
                }`
              }
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/editor/new"
          className="mt-8 inline-flex h-10 w-full max-w-[180px] items-center justify-center gap-2 self-start rounded-full bg-black px-4 text-sm font-bold text-white transition hover:bg-verified hover:text-black"
        >
          <Edit3 size={16} aria-hidden="true" />
          Write
        </NavLink>

        <div className="mt-auto border-t border-surface pt-6">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80"
              alt="Alex Rivera"
              className="h-10 w-10 rounded-full object-cover grayscale"
            />
            <div>
              <p className="font-semibold">Alex Rivera</p>
              <p className="text-sm text-muted">@arivera.dev</p>
            </div>
          </div>
        </div>
      </aside>
      {sidebarOpen && <button aria-label="Close menu overlay" className="fixed inset-0 z-20 bg-black/20 lg:hidden" onClick={toggleSidebar} />}
    </>
  );
}
