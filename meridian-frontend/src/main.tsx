import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { Onboarding } from './pages/Onboarding';
import { Feed } from './pages/Feed';
import { PostDetail } from './pages/PostDetail';
import { ComposeEditor } from './pages/Editor';
import { PatchReview } from './pages/PatchReview';
import { ForkLineage } from './pages/ForkLineage';
import { AuthorProfile } from './pages/AuthorProfile';
import { Wallet } from './pages/Wallet';
import { MentoredTrack } from './pages/MentoredTrack';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Auth / Onboarding route without shell */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Main app routes within shell */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/discover" element={<Feed />} /> {/* Mock redirect */}
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/editor/new" element={<ComposeEditor />} />
          <Route path="/editor/:id" element={<ComposeEditor />} />
          <Route path="/post/:id/patches" element={<PatchReview />} />
          <Route path="/post/:id/forks" element={<ForkLineage />} />
          <Route path="/profile/:username" element={<AuthorProfile />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/mentored" element={<MentoredTrack />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
