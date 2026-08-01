import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { HeaderBar } from './components/HeaderBar';
import { RightPanel } from './components/RightPanel';
import { Sidebar } from './components/Sidebar';
import { SpaceBackground } from './components/SpaceBackground';
import { Toast } from './components/Toast';
import { DiscoverPage } from './pages/DiscoverPage';
import { EditorPage } from './pages/EditorPage';
import { FeedPage } from './pages/FeedPage';
import { LandingPage } from './pages/LandingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { ProfilePage, ProfileShell } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { WalletPage } from './pages/WalletPage';
import { SettingsPage } from './pages/SettingsPage';
import { useUiStore } from './store/uiStore';

function AppShell() {
  const isAuthenticated = useUiStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return (
    <div className="relative z-10 h-screen overflow-hidden text-surface" style={{ background: '#1C1B1B' }}>
      <div className="flex h-full">
        <Sidebar />
        <div className="h-full min-w-0 flex-1 overflow-y-auto">
          <div className="flex min-w-0">
            <main className="min-w-0 flex-1">
              <HeaderBar />
              <Routes>
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/post/:id" element={<PostDetailPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/profile/:username/*" element={<ProfileShell />} />
                <Route path="/mentored" element={<DiscoverPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/discover" replace />} />
              </Routes>
            </main>
            <RightPanel />
          </div>
        </div>
        <Toast />
      </div>
    </div>
  );
}

export default function App() {
  const restoreSession = useUiStore((s) => s.restoreSession);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  return (
    <>
      <SpaceBackground />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/editor/new" element={<EditorPage />} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </>
  );
}
