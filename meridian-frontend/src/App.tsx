import { Navigate, Route, Routes } from 'react-router-dom';
import { HeaderBar } from './components/HeaderBar';
import { RightPanel } from './components/RightPanel';
import { Sidebar } from './components/Sidebar';
import { DiscoverPage } from './pages/DiscoverPage';
import { EditorPage } from './pages/EditorPage';
import { FeedPage } from './pages/FeedPage';
import { LandingPage } from './pages/LandingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage, ProfileShell } from './pages/ProfilePage';
import { WalletPage } from './pages/WalletPage';

function AppShell() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
      <div className="grid min-h-screen grid-cols-[260px_minmax(0,1fr)_320px]">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <HeaderBar />
          <Routes>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/profile/:username/*" element={<ProfileShell />} />
            <Route path="/mentored" element={<DiscoverPage />} />
            <Route path="/settings" element={<ProfileShell />} />
            <Route path="*" element={<Navigate to="/discover" replace />} />
          </Routes>
        </main>
        <RightPanel />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/editor/new" element={<EditorPage />} />
      <Route path="/*" element={<AppShell />} />
    </Routes>
  );
}
