import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Bookmark, Heart, MessageCircle, MoreHorizontal, Repeat2, Send, Share2, ThumbsDown, ThumbsUp, UserMinus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../components/Badge';
import { useUiStore } from '../store/uiStore';
import { fetchPost } from '../services/mockApi';
import type { Post } from '../services/mockApi';

const colors = {
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  border: '#2f3336',
  card: '#14171c',
  cardHover: '#1a1d24',
  verified: '#00C896',
};

type Comment = {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  body: string;
  time: string;
  likes: number;
};

const mockComments: Record<string, Comment[]> = {
  'io-uring-loop': [
    { id: 'c1', author: 'James K.', handle: '@kernel_notes', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', body: 'Great work on the io_uring integration. Did you benchmark against epoll with the same concurrency profile?', time: '45m ago', likes: 23 },
    { id: 'c2', author: 'Priya M.', handle: '@ops_lab', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', body: 'We saw similar latency improvements in our production deployment. The completion polling strategy is key.', time: '22m ago', likes: 16 },
  ],
  'meridian-cli': [
    { id: 'c3', author: 'Alex R.', handle: '@arivera.dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', body: 'The static analysis integration looks promising. How does it handle cross-repo dependencies?', time: '1h ago', likes: 8 },
  ],
  'raft-go': [
    { id: 'c4', author: 'Sarah C.', handle: '@schen_dev', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80', body: 'Brilliant simplification of the Raft protocol. The leader election section is exceptionally clear.', time: '30m ago', likes: 31 },
    { id: 'c5', author: 'Marcus T.', handle: '@mthorne_ops', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80', body: 'Have you considered adding a section on log compaction? That would make this a complete reference.', time: '15m ago', likes: 12 },
  ],
};

function PostDetailSkeleton() {
  return (
    <div className="px-4 py-8 sm:px-5" style={{ color: colors.muted }}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded" style={{ background: colors.border }} />
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full" style={{ background: colors.border }} />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded" style={{ background: colors.border }} />
            <div className="h-3 w-24 rounded" style={{ background: colors.border }} />
          </div>
        </div>
        <div className="h-6 w-3/4 rounded" style={{ background: colors.border }} />
        <div className="h-4 w-full rounded" style={{ background: colors.border }} />
        <div className="h-4 w-full rounded" style={{ background: colors.border }} />
        <div className="h-4 w-2/3 rounded" style={{ background: colors.border }} />
      </div>
    </div>
  );
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const showToast = useUiStore((s) => s.showToast);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [openMenu, setOpenMenu] = useState(false);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id!),
    enabled: !!id,
  });

  if (isLoading) return <PostDetailSkeleton />;
  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20" style={{ color: colors.muted }}>
        <p className="text-lg">Post not found</p>
        <button className="mt-4 rounded-full px-4 py-2 text-sm font-bold" style={{ background: colors.verified, color: '#000' }} onClick={() => navigate('/feed')}>
          Back to Feed
        </button>
      </div>
    );
  }

  const comments = mockComments[post.id] || [];

  return (
    <article>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md" style={{ background: 'rgba(28,27,27,0.85)', borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-5 px-4 py-2 sm:px-5">
          <button className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[#1a1d24]" style={{ color: colors.primary }} onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <span className="text-lg font-bold" style={{ color: colors.primary }}>Post</span>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        {/* Author row */}
        <div className="flex items-start gap-3">
          <img src={post.avatar} alt="" className="h-12 w-12 rounded-full object-cover grayscale" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-[17px]" style={{ color: colors.primary }}>{post.author}</h2>
                  <Badge status={post.status} />
                </div>
                <div className="flex items-center gap-1.5 text-sm" style={{ color: colors.muted }}>
                  <span>{post.handle}</span>
                  <span>·</span>
                  <span>{post.role}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0">
            <button className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-[#1a1d24]" style={{ color: colors.muted }} aria-label="More actions" onClick={() => setOpenMenu(!openMenu)}>
              <MoreHorizontal size={18} />
            </button>
            {openMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(false)} />
                <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border py-1 shadow-xl" style={{ background: '#14171c', borderColor: '#2f3336' }}>
                  <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); showToast('Link copied!', 'success'); setOpenMenu(false); }}>
                    <Share2 size={15} /> Copy link
                  </button>
                  <div className="mx-2 my-1 border-t" style={{ borderColor: '#2f3336' }} />
                  <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Marked as Interested', 'success'); setOpenMenu(false); }}>
                    <ThumbsUp size={15} /> Interested
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Marked as Not Interested', 'success'); setOpenMenu(false); }}>
                    <ThumbsDown size={15} /> Not Interested
                  </button>
                  <div className="mx-2 my-1 border-t" style={{ borderColor: '#2f3336' }} />
                  <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Unfollowed', 'success'); setOpenMenu(false); }}>
                    <UserMinus size={15} /> Unfollow
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Reported', 'success'); setOpenMenu(false); }}>
                    <BarChart3 size={15} /> Report post
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-bold leading-8" style={{ color: colors.primary }}>
          {post.title}
        </h1>

        {/* Meta row */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <span style={{ color: colors.verified }}>{post.patched}</span>
          {post.version && <span style={{ color: colors.secondary }}>Version: <b style={{ color: colors.primary }}>{post.version}</b></span>}
          <span style={{ color: colors.secondary }}>
            Impact: <b style={{ color: colors.primary }}>{post.impactScore}</b>
          </span>
          <span style={{ color: colors.secondary }}>{post.age}</span>
        </div>

        {/* Full body */}
        <p className="mt-5 text-[17px] leading-7" style={{ color: colors.primary }}>
          {post.excerpt}
        </p>

        {/* Code block */}
        {post.code && (
          <pre className="mt-5 max-w-[680px] overflow-x-auto rounded-lg p-4 font-mono text-[14px] leading-6" style={{ background: '#0a0c10', border: `1px solid ${colors.border}`, color: '#c9d1d9' }}>
            <code>{post.code}</code>
          </pre>
        )}

        {/* Tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-md px-3 py-1 text-sm font-medium" style={{ background: 'rgba(0,200,150,0.08)', color: colors.verified }}>
              [{tag}]
            </span>
          ))}
        </div>

        {/* Patch history */}
        <details className="mt-5 max-w-[680px] rounded-lg px-4 py-3" style={{ border: `1px solid ${colors.border}` }}>
          <summary className="cursor-pointer text-sm font-semibold" style={{ color: colors.primary }}>Patch history timeline</summary>
          <ol className="mt-3 space-y-2" style={{ color: colors.secondary }}>
            {(post.lineage && post.lineage.length > 0 ? post.lineage : [
              `${post.version || 'v1'} accepted — benchmark correction by @kernel_notes`,
              'v1.1 merged — epoll fallback note by @ops-lab',
              'v1.0 initial submission'
            ]).map((entry, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold" style={{ background: 'rgba(0,200,150,0.15)', color: colors.verified }}>{i + 1}</span>
                {entry}
              </li>
            ))}
          </ol>
        </details>

        {/* Impact stats */}
        <div className="mt-5 grid grid-cols-3 gap-4 rounded-lg border py-4" style={{ borderColor: colors.border }}>
          {[
            ['Likes', post.likes],
            ['Comments', post.comments],
            ['Forks', post.forks],
          ].map(([label, value]) => (
            <div key={label as string} className="text-center">
              <div className="text-xl font-bold" style={{ color: colors.primary }}>{value}</div>
              <div className="mt-0.5 text-xs" style={{ color: colors.muted }}>{label as string}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex max-w-[600px] items-center justify-between border-y py-3" style={{ borderColor: colors.border, color: colors.muted }}>
          <button className="inline-flex items-center gap-2 text-sm transition-colors hover:text-rose-500" onClick={() => { setLiked(!liked); }}>
            <Heart size={20} fill={liked ? '#f43f5e' : 'none'} stroke={liked ? '#f43f5e' : 'currentColor'} />
            <span>{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <button className="inline-flex items-center gap-2 text-sm transition-colors hover:text-sky-500">
            <MessageCircle size={20} />
            <span>{post.comments}</span>
          </button>
          <button className="inline-flex items-center gap-2 text-sm transition-colors hover:text-[#00C896]" onClick={() => navigate(`/editor/new?fork=${post.id}&title=${encodeURIComponent(post.title)}&body=${encodeURIComponent(post.excerpt)}`)}>
            <Repeat2 size={20} />
            <span>{post.forks}</span>
          </button>
          <button className="inline-flex items-center gap-2 text-sm transition-colors hover:text-surface" onClick={() => { setSaved(!saved); showToast(saved ? 'Removed from bookmarks' : 'Bookmarked!', 'success'); }}>
            <Bookmark size={20} fill={saved ? '#e7e9ea' : 'none'} />
          </button>
          <button className="inline-flex items-center gap-2 text-sm transition-colors hover:text-sky-500" onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); showToast('Link copied!', 'success'); }}>
            <Share2 size={20} />
            <span>Share</span>
          </button>
          <span className="inline-flex items-center gap-1.5 text-sm">
            <BarChart3 size={20} />
            {post.impressions.toLocaleString()}
          </span>
        </div>

        {/* Comment composer */}
        <div className="mt-5 flex gap-3">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=120&q=80"
            alt=""
            className="h-10 w-10 rounded-full object-cover grayscale"
          />
          <div className="flex flex-1 items-center gap-3 rounded-lg border px-4 py-2" style={{ borderColor: colors.border }}>
            <input
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: colors.primary, '--tw-placeholder-color': colors.muted } as React.CSSProperties}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              className="grid h-8 w-8 place-items-center rounded-full transition-colors"
              style={{ background: commentText.trim() ? colors.verified : 'transparent', color: commentText.trim() ? '#000' : colors.muted }}
              disabled={!commentText.trim()}
              onClick={() => { showToast('Comment posted!', 'success'); setCommentText(''); }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-6 space-y-0">
          <h3 className="mb-4 text-lg font-bold" style={{ color: colors.primary }}>Comments ({comments.length})</h3>
          {comments.length === 0 ? (
            <p className="text-sm" style={{ color: colors.muted }}>No comments yet. Be the first to comment.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 border-b py-4" style={{ borderColor: colors.border }}>
                <img src={comment.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover grayscale" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: colors.primary }}>{comment.author}</span>
                    <span className="text-xs" style={{ color: colors.muted }}>{comment.handle}</span>
                    <span style={{ color: colors.muted }}>·</span>
                    <span className="text-xs" style={{ color: colors.muted }}>{comment.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5" style={{ color: colors.primary }}>{comment.body}</p>
                  <button className="mt-1.5 inline-flex items-center gap-1 text-xs transition-colors hover:text-rose-500" style={{ color: colors.muted }}>
                    <Heart size={14} /> {comment.likes}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </article>
  );
}
