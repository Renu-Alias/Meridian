import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Bookmark, Heart, MessageCircle, MoreHorizontal, Repeat2, Send, Share2, ThumbsDown, ThumbsUp, UserMinus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../components/Badge';
import { useUiStore } from '../store/uiStore';
import { api } from '../services/api';
import { toPost, toComments } from '../services/adapters';
import type { Comment } from '../services/adapters';

const colors = {
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  border: '#2f3336',
  card: '#151515',
  cardHover: '#1a1d24',
  verified: '#2DD4A3',
};

/** Derive a topic-oriented Unsplash cover image from the post's first tag. */
function coverImageUrl(tags: string[]): string {
  const tagMap: Record<string, string> = {
    Rust: 'systems-programming',
    Go: 'golang',
    Python: 'python-code',
    TypeScript: 'javascript',
    Kubernetes: 'cloud-infrastructure',
    Docker: 'containers',
    PostgreSQL: 'database',
    Redis: 'server',
    Kafka: 'data-pipeline',
    AWS: 'cloud-computing',
    LLM: 'artificial-intelligence',
    eBPF: 'linux-kernel',
    React: 'frontend',
    'Next.js': 'web-development',
    GraphQL: 'api',
  };
  const keyword = tags.length > 0 ? (tagMap[tags[0]] ?? tags[0].toLowerCase().replace(/[^a-z0-9]/g, '-')) : 'software-engineering';
  // Use a hash of the keyword for a stable but varied image
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) hash = (hash * 31 + keyword.charCodeAt(i)) >>> 0;
  return `https://picsum.photos/seed/${keyword}-${hash % 99}/1200/400`;
}

/** Parse a markdown-ish body into typed segments for structured rendering. */
type BodySegment =
  | { kind: 'h3'; text: string }
  | { kind: 'code'; lang: string; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'p'; text: string };

function parseBody(raw: string): BodySegment[] {
  const segments: BodySegment[] = [];
  const lines = raw.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // H3 heading
    if (line.startsWith('### ')) {
      segments.push({ kind: 'h3', text: line.slice(4).trim() });
      i++;
      continue;
    }
    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      segments.push({ kind: 'code', lang, text: codeLines.join('\n') });
      continue;
    }
    // Bullet list block
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2).trim());
        i++;
      }
      segments.push({ kind: 'list', items });
      continue;
    }
    // Numbered list block
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, '').trim());
        i++;
      }
      segments.push({ kind: 'list', items });
      continue;
    }
    // Blank line — skip
    if (line.trim() === '') { i++; continue; }
    // Paragraph — consume until blank or heading
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('### ') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('- ') &&
      !lines[i].startsWith('* ') &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) segments.push({ kind: 'p', text: paraLines.join(' ') });
  }
  return segments;
}

/** Render a single body segment as JSX. */
function BodySegmentEl({ seg }: { seg: BodySegment }) {
  if (seg.kind === 'h3') {
    return (
      <h3 className="mt-7 mb-2 text-lg font-bold" style={{ color: '#e7e9ea' }}>
        {seg.text}
      </h3>
    );
  }
  if (seg.kind === 'code') {
    return (
      <pre
        className="my-4 overflow-x-auto rounded-lg p-4 font-mono text-[13px] leading-6 thin-scrollbar"
        style={{ background: '#0a0c10', border: '1px solid #2f3336', color: '#c9d1d9' }}
      >
        {seg.lang && (
          <span className="mb-2 block text-[10px] uppercase tracking-widest" style={{ color: '#536471' }}>
            {seg.lang}
          </span>
        )}
        <code>{seg.text}</code>
      </pre>
    );
  }
  if (seg.kind === 'list') {
    return (
      <ul className="my-3 space-y-1.5 pl-5" style={{ color: '#e7e9ea' }}>
        {seg.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[16px] leading-6">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#2DD4A3' }} />
            <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
          </li>
        ))}
      </ul>
    );
  }
  // paragraph
  return (
    <p
      className="my-3 text-[16px] leading-7"
      style={{ color: '#c9d1d9' }}
      dangerouslySetInnerHTML={{ __html: seg.text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e7e9ea">$1</strong>') }}
    />
  );
}

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
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);
  const me = useUiStore((s) => s.me);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [openMenu, setOpenMenu] = useState(false);
  const composerRef = useRef<HTMLDivElement>(null);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.getPost(id!).then(toPost),
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['qa', id],
    queryFn: () => api.getQA(id!).then(toComments),
    enabled: !!id,
  });

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    try {
      await api.askQuestion(id!, text);
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['qa', id] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      showToast('Comment posted!', 'success');
    } catch (err) {
      showToast('Failed to post comment', 'info');
    }
  };

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

  return (
    <article>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md" style={{ background: 'rgba(10,10,10,0.85)', borderBottom: `1px solid ${colors.border}` }}>
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
          <img
            src={post.avatar}
            alt=""
            className="h-12 w-12 rounded-full object-cover grayscale cursor-pointer"
            onClick={() => navigate(`/profile/${post.handle.slice(1)}`)}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h2
                    className="font-bold text-[17px] cursor-pointer hover:underline"
                    style={{ color: colors.primary }}
                    onClick={() => navigate(`/profile/${post.handle.slice(1)}`)}
                  >
                    {post.author}
                  </h2>
                  <Badge status={post.status} />
                </div>
                <div className="flex items-center gap-1.5 text-sm" style={{ color: colors.muted }}>
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => navigate(`/profile/${post.handle.slice(1)}`)}
                  >
                    {post.handle}
                  </span>
                  {post.role && (
                    <>
                      <span>·</span>
                      <span>{post.role}</span>
                    </>
                  )}
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
                <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border py-1 shadow-xl" style={{ background: '#151515', borderColor: '#2f3336' }}>
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

        {/* Cover image */}
        <div className="mt-4 overflow-hidden rounded-xl" style={{ border: `1px solid ${colors.border}` }}>
          <img
            src={coverImageUrl(post.tags)}
            alt={post.title}
            className="h-48 w-full object-cover sm:h-64"
            style={{ filter: 'brightness(0.75) saturate(0.6)' }}
          />
        </div>

        {/* Title */}
        <h1 className="mt-5 text-2xl font-bold leading-8" style={{ color: colors.primary }}>
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

        {/* Structured body */}
        <div className="mt-5 max-w-[680px]">
          {parseBody(post.body || post.excerpt).map((seg, i) => (
            <BodySegmentEl key={i} seg={seg} />
          ))}
        </div>

        {/* Tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full px-3 py-1 text-sm font-semibold" style={{ background: 'rgba(45,212,163,0.14)', color: colors.verified }}>
              {tag}
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
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold" style={{ background: 'rgba(45,212,163,0.15)', color: colors.verified }}>{i + 1}</span>
                {entry}
              </li>
            ))}
          </ol>
        </details>

        {/* Impact stats */}
        <div className="mt-5 grid grid-cols-3 gap-4 rounded-xl border py-4" style={{ borderColor: colors.border, background: colors.card }}>
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

        {/* Actions — all icons share the same idle muted color */}
        <div className="mt-5 flex max-w-[600px] items-center gap-1 border-y py-3" style={{ borderColor: colors.border }}>
          {/* Like */}
          <button
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-rose-500/10 hover:text-rose-500"
            style={{ color: liked ? '#f43f5e' : colors.muted }}
            onClick={() => { setLiked(!liked); api.addReaction(post.id, 'upvote').catch(() => {}); }}
          >
            <Heart size={20} fill={liked ? '#f43f5e' : 'none'} stroke={liked ? '#f43f5e' : 'currentColor'} />
            <span>{post.likes + (liked ? 1 : 0)}</span>
          </button>
          {/* Comment */}
          <button
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-sky-500/10 hover:text-sky-500"
            style={{ color: colors.muted }}
            onClick={() => { composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); composerRef.current?.querySelector('input')?.focus(); }}
          >
            <MessageCircle size={20} />
            <span>{post.comments}</span>
          </button>
          {/* Fork */}
          <button
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-[#2DD4A3]/10 hover:text-[#2DD4A3]"
            style={{ color: colors.muted }}
            onClick={() => navigate(`/editor/new?fork=${post.id}&title=${encodeURIComponent(post.title)}&body=${encodeURIComponent(post.excerpt)}`)}
          >
            <Repeat2 size={20} />
            <span>{post.forks}</span>
          </button>
          {/* Save */}
          <button
            className="flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm transition-all hover:text-[#e7e9ea]"
            style={{ color: saved ? '#e7e9ea' : colors.muted }}
            onClick={() => { setSaved(!saved); showToast(saved ? 'Removed from bookmarks' : 'Bookmarked!', 'success'); }}
          >
            <Bookmark size={18} fill={saved ? '#e7e9ea' : 'none'} />
          </button>
          {/* Share */}
          <button
            className="flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm transition-all hover:text-sky-500"
            style={{ color: colors.muted }}
            onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); showToast('Link copied!', 'success'); }}
          >
            <Share2 size={18} />
          </button>
          {/* Stats */}
          <span className="flex items-center gap-1.5 text-sm" style={{ color: colors.muted }}>
            <BarChart3 size={18} />
            {post.impressions.toLocaleString()}
          </span>
        </div>

        {/* Comment composer */}
        <div className="mt-5 flex gap-3" ref={composerRef}>
          <img
            src={me?.avatar_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=120&q=80'}
            alt=""
            className="h-10 w-10 rounded-full object-cover grayscale"
          />
          <div className="flex flex-1 items-center gap-3 rounded-xl border px-4 py-2" style={{ borderColor: colors.border, background: colors.card }}>
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
              onClick={submitComment}
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
                  <button className="mt-1.5 inline-flex items-center gap-1 text-xs transition-colors hover:text-rose-500" style={{ color: colors.muted }} onClick={() => showToast('Liked comment!', 'success')}>
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
