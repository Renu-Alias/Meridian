import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { QueryProvider } from './queryClient';
import { HelmetProvider } from 'react-helmet-async';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Editor from './pages/Editor';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Wallet from './pages/Wallet';
import MentoredTrack from './pages/MentoredTrack';

function App() {
  return (
    <HelmetProvider>
      <QueryProvider>
        <BrowserRouter>
          <Layout>
            <NavBar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/mentored" element={<MentoredTrack />} />
            </Routes>
            <Footer />
          </Layout>
        </BrowserRouter>
      </QueryProvider>
    </HelmetProvider>
  );
}

export default App;
