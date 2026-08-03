import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { api } from '../services/api';
import { toPost } from '../services/adapters';
import type { Post } from '../services/mockApi';
import { compactNumber } from '../utils/format';

const colors = {
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  border: '#2f3336',
  card: '#151515',
  verified: '#2DD4A3',
};

function PostRow({ post }: { post: Post }) {
  const navigate = useNavigate();
  return (
    <article
      className="cursor-pointer border-b px-5 py-4 transition-colors hover:bg-[#1a1d24]/50"
      style={{ borderColor: '#2a2a2a' }}
      onClick={() => navigate(`/post/${post.id}`)}
    >
      <div className="flex items-start gap-3">
        <img
          src={post.avatar}
          alt=""
          className="mt-0.5 h-9 w-9 shrink-0 rounded-full object-cover grayscale"
          onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.handle.slice(1)}`); }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
            <span className="font-bold cursor-pointer hover:underline" style={{ color: colors.primary }}
              onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.handle.slice(1)}`); }}>
              {post.author}
            </span>
            <span className="cursor-pointer hover:underline" style={{ color: colors.muted }}
              onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.handle.slice(1)}`); }}>
              {post.handle}
            </span>
            <span style={{ color: colors.muted }}>· {post.age}</span>
          </div>
          <p className="mt-1 max-w-[620px] text-[15px] leading-5" style={{ color: colors.primary }}>{post.title}</p>
          <p className="mt-0.5 max-w-[620px] text-[13px] leading-5" style={{ color: colors.secondary }}>{post.excerpt}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <button
                key={tag}
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-[#2DD4A3]/25"
                style={{ background: 'rgba(45,212,163,0.14)', color: colors.verified }}
                onClick={(e) => { e.stopPropagation(); navigate(`/tag/${encodeURIComponent(tag)}`); }}
              >
                #{tag}
              </button>
            ))}
          </div>
          <div className="mt-2.5 flex items-center gap-4 text-xs" style={{ color: colors.muted }}>
            <span className="flex items-center gap-1"><Heart size={13} /> {post.likes}</span>
            <span className="flex items-center gap-1"><MessageCircle size={13} /> {post.comments}</span>
            <span className="flex items-center gap-1"><Repeat2 size={13} /> {post.forks}</span>
            <span className="flex items-center gap-1"><BarChart3 size={13} /> {compactNumber(post.impressions)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = (params.get('q') ?? '').trim();

  const { data: posts = [] } = useQuery({
    queryKey: ['search-posts', q],
    queryFn: async () => (await api.searchPosts(q, 50)).items.map(toPost),
    enabled: q.length > 0,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['search-users', q],
    queryFn: () => api.searchUsers(q, 50),
    enabled: q.length > 0,
  });

  const { data: topics = [] } = useQuery({
    queryKey: ['search-topics', q],
    queryFn: () => api.searchTopics(q, 50),
    enabled: q.length > 0,
  });

  return (
    <div>
      <div className="border-b px-5 py-4 sm:px-5" style={{ borderColor: '#2a2a2a' }}>
        <h1 className="text-xl font-bold" style={{ color: colors.primary }}>Search results</h1>
        <p className="mt-0.5 text-sm" style={{ color: colors.muted }}>
          {q ? `Showing results for “${q}”` : 'Type something in the search bar to find posts, people, and topics.'}
        </p>
      </div>

      {q ? (
        <div>
          {/* Topics */}
          {topics.length > 0 && (
            <section className="border-b px-5 py-4" style={{ borderColor: '#2a2a2a' }}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: colors.muted }}>Topics</h2>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <button
                    key={t.name}
                    className="rounded-full px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-[#2DD4A3]/25"
                    style={{ background: 'rgba(45,212,163,0.14)', color: colors.verified }}
                    onClick={() => navigate(`/tag/${encodeURIComponent(t.name)}`)}
                  >
                    #{t.name} <span style={{ color: colors.muted }}>({t.count})</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* People */}
          {users.length > 0 && (
            <section className="border-b px-5 py-4" style={{ borderColor: '#2a2a2a' }}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: colors.muted }}>People</h2>
              <div className="space-y-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#1a1d24]/60"
                    onClick={() => navigate(`/profile/${u.username}`)}
                  >
                    <img src={u.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover grayscale" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold" style={{ color: colors.primary }}>{u.display_name}</span>
                      <span className="block truncate text-xs" style={{ color: colors.muted }}>@{u.username} · {u.role || 'Engineer'}</span>
                    </span>
                    {u.stack.length > 0 && (
                      <span className="hidden max-w-[220px] truncate text-xs sm:block" style={{ color: colors.muted }}>
                        {u.stack.slice(0, 4).join(' · ')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Posts */}
          <section>
            <h2 className="mb-1 px-5 pt-4 text-sm font-bold uppercase tracking-widest" style={{ color: colors.muted }}>Posts</h2>
            {posts.length === 0 ? (
              <p className="px-5 py-6 text-sm" style={{ color: colors.muted }}>
                No posts match “{q}”.
              </p>
            ) : (
              posts.map((post) => <PostRow key={post.id} post={post} />)
            )}
          </section>
        </div>
      ) : (
        <p className="px-5 py-10 text-sm" style={{ color: colors.muted }}>
          Search supports stack topics (e.g. “Rust”), people (e.g. a username), and post titles.
        </p>
      )}
    </div>
  );
}
