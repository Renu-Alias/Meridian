import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, PenTool, User, Wallet, GraduationCap, Settings, Edit3 } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, to: '/feed' },
  { label: 'Discover', icon: Compass, to: '/discover' },
  { label: 'Notifications', icon: Bell, to: '/notifications', hasBadge: true },
  { label: 'Write', icon: PenTool, to: '/editor/new' },
  { label: 'Profile', icon: User, to: '/profile/me' },
  { label: 'Wallet', icon: Wallet, to: '/wallet' },
  { label: 'Mentored Track', icon: GraduationCap, to: '/mentored', isAmber: true },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

export function LeftSidebar() {
  return (
    <div className="sticky top-0 h-screen flex flex-col py-6 px-4">
      {/* Logo */}
      <div className="mb-8 px-4 font-bold text-2xl tracking-tight">Meridian.</div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "group flex items-center space-x-4 px-4 py-3 text-lg transition-colors relative",
                isActive ? "text-surface font-medium" : "text-muted hover:text-surface"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active left bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-blue" />
                )}
                
                <div className="relative">
                  <item.icon className={clsx("w-6 h-6", isActive ? "text-accent-blue" : "text-muted group-hover:text-surface")} />
                  {item.hasBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-coral rounded-full border-2 border-primary" />
                  )}
                </div>

                <span className={clsx(isActive && item.isAmber && "text-accent-amber")}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Post Action */}
      <div className="mt-auto pt-6 px-4">
        <NavLink 
          to="/editor/new"
          className="flex items-center justify-center w-full bg-surface text-primary rounded-pill py-3 px-6 font-medium hover:opacity-90 transition-opacity"
        >
          <Edit3 className="w-5 h-5 mr-2" />
          Write
        </NavLink>
      </div>
    </div>
  );
}
