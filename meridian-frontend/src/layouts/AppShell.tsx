import { Outlet } from 'react-router-dom';
import { LeftSidebar } from './LeftSidebar';
import { RightPanel } from './RightPanel';
import { MobileTabBar } from './MobileTabBar';

export function AppShell() {
  return (
    <div className="min-h-screen bg-primary flex justify-center">
      <div className="w-full max-w-[1225px] flex">
        {/* Left Sidebar (Desktop/Tablet) */}
        <div className="hidden md:block w-[275px] shrink-0 border-r border-surface/20">
          <LeftSidebar />
        </div>

        {/* Center Content */}
        <main className="flex-1 min-w-0 max-w-[600px] border-r border-surface/20 relative pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* Right Panel (Desktop only) */}
        <div className="hidden xl:block w-[350px] shrink-0">
          <RightPanel />
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden">
        <MobileTabBar />
      </div>
    </div>
  );
}
