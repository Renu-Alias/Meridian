import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Bookmark, Share2 } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';

const TABS = [
  { id: 'stack', label: 'For your stack' },
  { id: 'following', label: 'Following' },
  { id: 'all', label: 'All' },
  { id: 'mentored', label: 'Mentored Track', amber: true },
];

export function Feed() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stack');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-primary/90 backdrop-blur-sm z-10 border-b border-surface/20">
        <h1 className="text-xl font-bold px-6 py-4">Home</h1>
        <div className="flex overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap',
                activeTab === tab.id ? 'text-surface' : 'text-muted hover:text-surface',
                tab.amber && 'text-accent-amber hover:text-accent-amber/80',
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-blue rounded-t-sm" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Content */}
      {loading ? (
        <div className="space-y-4 p-6">
          <div className="p-6 border border-surface/20 rounded-lg">
            <Skeleton height="1rem" width="30%" rounded="sm" />
            <Skeleton height="1.5rem" width="70%" rounded="md" className="mt-2" />
            <Skeleton height="1rem" width="90%" rounded="md" className="mt-2" />
          </div>
          <div className="p-6 border border-surface/20 rounded-lg">
            <Skeleton height="1rem" width="30%" rounded="sm" />
            <Skeleton height="1.5rem" width="70%" rounded="md" className="mt-2" />
            <Skeleton height="1rem" width="90%" rounded="md" className="mt-2" />
          </div>
        </div>
      ) : (
        <div className="divide-y divide-surface/20">
          {/* Mock Post Row */}
          <article className="p-6 hover:bg-surface/5 transition-colors cursor-pointer">
            <div className="flex items-center text-sm text-muted mb-2">
              <span className="font-medium text-surface">Sana</span>
              <span className="mx-2">·</span>
              <span>2 days ago</span>
              <span className="mx-2">·</span>
              <span className="px-2 py-0.5 border border-surface/20 rounded-pill text-xs">Patched 1d ago</span>
            </div>

            <h2 className="text-xl font-bold mb-2">Kafka Consumer Lag Tuning for High-Throughput Microservices</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs px-2 py-1 bg-surface/10 rounded-pill">Kafka</span>
              <span className="text-xs px-2 py-1 bg-surface/10 rounded-pill">Distributed Systems</span>
            </div>

            <div className="flex items-center space-x-6 text-muted">
              <button className="flex items-center space-x-2 hover:text-accent-amber transition-colors group">
                <Bookmark className="w-4 h-4 group-hover:fill-accent-amber" />
                <span className="text-sm">24</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-accent-blue transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="text-sm">12</span>
              </button>
              <div className="flex items-center text-accent-teal text-sm ml-auto">✓ Verified Claims</div>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

import { clsx } from 'clsx';
import { Bookmark, Share2 } from 'lucide-react';

const TABS = [
  { id: 'stack', label: 'For your stack' },
  { id: 'following', label: 'Following' },
  { id: 'all', label: 'All' },
  { id: 'mentored', label: 'Mentored Track', amber: true },
];

export function Feed() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const [activeTab, setActiveTab] = useState('stack');

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-primary/90 backdrop-blur-sm z-10 border-b border-surface/20">
        <h1 className="text-xl font-bold px-6 py-4">Home</h1>
        <div className="flex overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap",
                activeTab === tab.id ? "text-surface" : "text-muted hover:text-surface",
                tab.amber && "text-accent-amber hover:text-accent-amber/80"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-blue rounded-t-sm" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Content */}
        {loading ? (
          <div className="space-y-4">
            {/* PostCardSkeleton */}
            <div className="p-6 border border-surface/20 rounded-lg">
              <Skeleton height="1rem" width="30%" rounded="sm" />
              <Skeleton height="1.5rem" width="70%" rounded="md" className="mt-2" />
              <Skeleton height="1rem" width="90%" rounded="md" className="mt-2" />
            </div>
            <div className="p-6 border border-surface/20 rounded-lg">
              <Skeleton height="1rem" width="30%" rounded="sm" />
              <Skeleton height="1.5rem" width="70%" rounded="md" className="mt-2" />
              <Skeleton height="1rem" width="90%" rounded="md" className="mt-2" />
            </div>
          </div>
        ) : (
          <div className="divide-y divide-surface/20">
            {/* Mock Post Row */}
            <article className="p-6 hover:bg-surface/5 transition-colors cursor-pointer">
              <div className="flex items-center text-sm text-muted mb-2">
                <span className="font-medium text-surface">Sana</span>
                <span className="mx-2">·</span>
                <span>2 days ago</span>
                <span className="mx-2">·</span>
                <span className="px-2 py-0.5 border border-surface/20 rounded-pill text-xs">Patched 1d ago</span>
              </div>
              
              <h2 className="text-xl font-bold mb-2">Kafka Consumer Lag Tuning for High-Throughput Microservices</h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-1 bg-surface/10 rounded-pill">Kafka</span>
                <span className="text-xs px-2 py-1 bg-surface/10 rounded-pill">Distributed Systems</span>
              </div>

              <div className="flex items-center space-x-6 text-muted">
                <button className="flex items-center space-x-2 hover:text-accent-amber transition-colors group">
                  <Bookmark className="w-4 h-4 group-hover:fill-accent-amber" />
                  <span className="text-sm">24</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-accent-blue transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">12</span>
                </button>
                <div className="flex items-center text-accent-teal text-sm ml-auto">
                  ✓ Verified Claims
                </div>
              </div>
            </article>
          </div>
        )}

      <div className="divide-y divide-surface/20">
        {/* Mock Post Row */}
        <article className="p-6 hover:bg-surface/5 transition-colors cursor-pointer">
          <div className="flex items-center text-sm text-muted mb-2">
            <span className="font-medium text-surface">Sana</span>
            <span className="mx-2">·</span>
            <span>2 days ago</span>
            <span className="mx-2">·</span>
            <span className="px-2 py-0.5 border border-surface/20 rounded-pill text-xs">Patched 1d ago</span>
          </div>
          
          <h2 className="text-xl font-bold mb-2">Kafka Consumer Lag Tuning for High-Throughput Microservices</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-2 py-1 bg-surface/10 rounded-pill">Kafka</span>
            <span className="text-xs px-2 py-1 bg-surface/10 rounded-pill">Distributed Systems</span>
          </div>

          <div className="flex items-center space-x-6 text-muted">
            <button className="flex items-center space-x-2 hover:text-accent-amber transition-colors group">
              <Bookmark className="w-4 h-4 group-hover:fill-accent-amber" />
              <span className="text-sm">24</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-accent-blue transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">12</span>
            </button>
            <div className="flex items-center text-accent-teal text-sm ml-auto">
              ✓ Verified Claims
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
