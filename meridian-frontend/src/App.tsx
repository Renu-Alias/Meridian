import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { QueryProvider } from './queryClient';
import { HelmetProvider } from 'react-helmet-async';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Editor from './pages/Editor';

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
            </Routes>
            <Footer />
          </Layout>
        </BrowserRouter>
      </QueryProvider>
    </HelmetProvider>
  );
}

export default App;
