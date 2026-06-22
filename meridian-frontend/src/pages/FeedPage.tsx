import { useState } from 'react';
import { BarChart3, Bookmark, Code2, Heart, Image, MessageCircle, MoreHorizontal, Paperclip, Repeat2, Share2, Video } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../components/Badge';
import { fetchFeed } from '../services/mockApi';
import { compactNumber } from '../utils/format';

const colors = {
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  border: '#2f3336',
  card: '#14171c',
  cardHover: '#1a1d24',
  verified: '#00C896',
};

export function FeedPage() {
  const { data: posts = [] } = useQuery({ queryKey: ['feed'], queryFn: fetchFeed });
  const [postText, setPostText] = useState('');
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [forked, setForked] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const toggleLiked = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSaved = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleForked = (id: string) => {
    setForked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* Composer */}
      <section className="border border-zinc-900 bg-[#1C1B1B] p-4 sm:p-5 shadow-lg" style={{ borderColor: colors.border, background: 'rgb(28, 27, 27)' }}>
        <div className="flex gap-3">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=120&q=80"
            alt=""
            className="h-11 w-11 rounded-full object-cover grayscale"
          />
          <textarea
            className="min-h-[52px] flex-1 resize-none bg-transparent text-lg leading-6 outline-none"
            style={{ color: colors.primary, '--tw-placeholder-color': colors.muted } as React.CSSProperties}
            placeholder="What's the latest patch?"
            aria-label="Create a post"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
        </div>
        <div className="mt-3 flex items-center justify-between pl-[56px]">
          <div className="flex gap-4" style={{ color: colors.verified }}>
            {([['Code', Code2], ['Clip', Paperclip], ['Image', Image], ['Video', Video], ['Stats', BarChart3]] as const).map(([label, Icon]) => (
              <button key={label} aria-label={`Add ${label}`} className="hover:opacity-70 transition-opacity" onClick={() => setPostText((prev) => prev + ` [attach ${label}]`)}>
                <Icon size={18} />
              </button>
            ))}
          </div>
          <button
            className="h-9 rounded-full px-5 text-[15px] font-bold transition-all hover:brightness-110"
            style={{ background: colors.verified, color: '#000' }}
            onClick={() => { setPostText(''); }}
          >
            Post
          </button>
        </div>
      </section>

      {/* Feed */}
      <div>
        {posts.map((post) => (
          <article
            key={post.id}
            className="border-b px-4 py-3 transition-colors sm:px-5"
            style={{ borderColor: colors.border, background: 'transparent' }}
          >
            <div className="flex items-start gap-3">
              <img src={post.avatar} alt="" className="mt-1 h-11 w-11 shrink-0 rounded-full object-cover grayscale" />
              <div className="min-w-0 flex-1">
                {/* Author row */}
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[15px] leading-5">
                      <h2 className="truncate font-bold" style={{ color: colors.primary }}>{post.author}</h2>
                      <span className="truncate" style={{ color: colors.muted }}>{post.handle}</span>
                      <span style={{ color: colors.muted }}>·</span>
                      <span style={{ color: colors.muted }}>{post.age}</span>
                      <Badge status={post.status} />
                    </div>
                  </div>
                  <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-[#1a1d24]" style={{ color: colors.muted }} aria-label="More actions" onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); }}>
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* Impact */}
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px]">
                  <span style={{ color: colors.verified }}>{post.patched}</span>
                  <span style={{ color: colors.muted }}>
                    Impact: <b style={{ color: colors.primary }}>{post.impactScore}</b>
                  </span>
                </div>

                {/* Excerpt */}
                <p className="mt-1.5 max-w-[620px] text-[15px] leading-5" style={{ color: colors.primary }}>
                  {post.excerpt}
                </p>

                {/* Code block */}
                {post.code && (
                  <pre className="mt-2.5 max-w-[620px] overflow-x-auto rounded-lg p-3 font-mono text-[13px] leading-5" style={{ background: '#0a0c10', border: `1px solid ${colors.border}`, color: '#c9d1d9' }}>
                    <code>{post.code}</code>
                  </pre>
                )}

                {/* Tags */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-md px-2 py-0.5 text-xs font-medium" style={{ background: 'rgba(0,200,150,0.08)', color: colors.verified }}>
                      [{tag}]
                    </span>
                  ))}
                </div>

                {/* Patch history */}
                <details className="mt-2.5 max-w-[620px] rounded-lg px-3 py-2 text-[13px]" style={{ border: `1px solid ${colors.border}` }}>
                  <summary className="cursor-pointer font-semibold" style={{ color: colors.primary }}>Patch history timeline</summary>
                  <ol className="mt-2 space-y-1.5" style={{ color: colors.secondary }}>
                    <li>v2.4 accepted benchmark correction by @kernel_notes</li>
                    <li>v2.3 merged epoll fallback note by @ops-lab</li>
                  </ol>
                </details>

                {/* Actions */}
                <div className="mt-2.5 flex max-w-[600px] items-center justify-between text-[13px]" style={{ color: colors.muted }}>
                  <button className="inline-flex items-center gap-1.5 transition-colors hover:text-sky-500" onClick={() => { setReplyingTo(replyingTo === post.id ? null : post.id); setReplyText(''); }}>
                    <MessageCircle size={17} />
                    {post.comments}
                  </button>
                  <button className="inline-flex items-center gap-1.5 transition-colors hover:text-[#00C896]" onClick={() => toggleForked(post.id)}>
                    <Repeat2 size={17} style={{ color: forked.has(post.id) ? colors.verified : undefined }} />
                    {post.forks + (forked.has(post.id) ? 1 : 0)}
                  </button>
                  <button className="inline-flex items-center gap-1.5 transition-colors hover:text-rose-500" onClick={() => toggleLiked(post.id)}>
                    <Heart size={17} fill={liked.has(post.id) ? '#f43f5e' : 'none'} />
                    {post.likes + (liked.has(post.id) ? 1 : 0)}
                  </button>
                  <button className="inline-flex items-center gap-1.5 transition-colors hover:text-surface" onClick={() => toggleSaved(post.id)}>
                    <Bookmark size={17} fill={saved.has(post.id) ? '#e7e9ea' : 'none'} />
                    {saved.has(post.id) ? 'Saved' : 'Save'}
                  </button>
                  <button className="hidden items-center gap-1.5 transition-colors hover:text-sky-500 sm:inline-flex" onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); alert('Link copied!'); }}>
                    <Share2 size={17} />
                    Share
                  </button>
                  <span className="inline-flex items-center gap-1.5">
                    <BarChart3 size={17} />
                    {compactNumber(post.impressions)}
                  </span>
                </div>

                {/* Inline reply */}
                {replyingTo === post.id && (
                  <div className="mt-3 flex gap-3 pl-12">
                    <textarea
                      className="min-h-[40px] flex-1 resize-none rounded-lg border bg-transparent p-2 text-sm leading-5 outline-none"
                      style={{ borderColor: colors.border, color: colors.primary }}
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button
                      className="h-fit rounded-full px-4 py-1.5 text-xs font-bold transition-all hover:brightness-110"
                      style={{ background: colors.verified, color: '#000' }}
                      onClick={() => { setReplyText(''); setReplyingTo(null); }}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
