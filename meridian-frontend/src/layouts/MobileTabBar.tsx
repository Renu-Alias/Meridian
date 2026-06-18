import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, User, Edit3 } from 'lucide-react';
import { clsx } from 'clsx';

const TABS = [
  { label: 'Home', icon: Home, to: '/feed' },
  { label: 'Discover', icon: Compass, to: '/discover' },
  { label: 'Write', icon: Edit3, to: '/editor/new' },
  { label: 'Notifications', icon: Bell, to: '/notifications', hasBadge: true },
  { label: 'Profile', icon: User, to: '/profile/me' },
];

export function MobileTabBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-primary border-t border-surface/20 flex items-center justify-around px-2 z-50">
      {TABS.map((tab) => (
        <NavLink
          key={tab.label}
          to={tab.to}
          className={({ isActive }) =>
            clsx(
              "p-3 rounded-full relative transition-colors",
              isActive ? "text-accent-blue" : "text-muted hover:text-surface"
            )
          }
        >
          <tab.icon className="w-6 h-6" />
          {tab.hasBadge && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-coral rounded-full border-2 border-primary" />
          )}
        </NavLink>
      ))}
    </div>
  );
}
