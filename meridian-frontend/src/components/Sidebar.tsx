import { HomeIcon, FeedIcon, DocumentTextIcon, CogIcon, UserIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'Home', icon: HomeIcon },
    { to: '/feed', label: 'Feed', icon: FeedIcon },
    { to: '/profile', label: 'Profile', icon: UserIcon },
    { to: '/wallet', label: 'Wallet', icon: DocumentTextIcon },
    { to: '/settings', label: 'Settings', icon: CogIcon },
  ];
  return (
    <aside className="hidden lg:block w-80 bg-surface border-l border-muted p-4 overflow-y-auto">
      <nav className="flex flex-col space-y-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted text-muted hover:text-primary"
          >
            <item.icon className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
