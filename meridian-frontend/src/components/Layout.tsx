import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-surface text-primary">
      {/* Left navigation */}
      <aside className="hidden md:block w-64 p-4 border-r border-muted">
        {/* Placeholder for NavBar component */}
        <nav>
          <div className="text-xl font-bold mb-4">Meridian</div>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-verified">Home</a></li>
            <li><a href="/feed" className="hover:text-verified">Feed</a></li>
            <li><a href="/editor" className="hover:text-verified">Write</a></li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>

      {/* Right sidebar */}
      <aside className="hidden lg:block w-80 p-4 border-l border-muted">
        {/* Placeholder for Sidebar widgets */}
        <div className="text-sm text-muted">Sidebar widgets</div>
      </aside>
    </div>
  );
}
