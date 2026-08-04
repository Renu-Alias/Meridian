import { useState } from 'react';
import { BarChart3, Bookmark, Code2, Heart, Image, MessageCircle, MoreHorizontal, Paperclip, Repeat2, Share2, ThumbsDown, ThumbsUp, UserMinus, Video } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { useUiStore } from '../store/uiStore';
import { api } from '../services/api';
import { toPost, DEFAULT_AVATAR } from '../services/adapters';
import { compactNumber } from '../utils/format';

const colors = {
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  border: '#2f3336',
  card: '#151515',
  cardHover: '#1a1d24',
  verified: '#2DD4A3',
};

export function FeedPage({ tag }: { tag?: string }) {
  const queryClient = useQueryClient();
  const { data: posts = [] } = useQuery({
    queryKey: ['feed', tag ?? 'all'],
    queryFn: async () => (await api.getFeed({ limit: 50, tag })).items.map(toPost),
  });
  const navigate = useNavigate();
  const showToast = useUiStore((s) => s.showToast);
  const me = useUiStore((s) => s.me);
  const [postText, setPostText] = useState('');
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const publishPost = async () => {
    const text = postText.trim();
    if (!text) return;
    try {
      const created = await api.createPost({
        title: text.split('\n')[0].slice(0, 80),
        body: text,
        excerpt: text.slice(0, 200),
      });
      await api.publishPost(created.id);
      setPostText('');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      showToast('Post published!', 'success');
    } catch (err) {
      showToast('Failed to publish post', 'info');
    }
  };

  const toggleLiked = (postId: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
    api.addReaction(postId, 'upvote').catch(() => {});
  };

  const toggleSaved = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    api.addReaction(id, 'bookmark').catch(() => {});
  };

  const submitReply = async (postId: string) => {
    const text = replyText.trim();
    if (!text) return;
    try {
      await api.askQuestion(postId, text);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      showToast('Reply posted!', 'success');
    } catch (err) {
      showToast('Failed to post reply', 'info');
    }
    setReplyText('');
    setReplyingTo(null);
  };

  return (
    <div>
      {/* Composer */}
      <section className="border-b px-4 pb-4 pt-7 sm:px-5 sm:pb-5" style={{ borderColor: '#2a2a2a', background: '#151515' }}>
        <div className="flex gap-3">
          <img
            src={me?.avatar_url || DEFAULT_AVATAR}
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
          <div className="flex gap-1">
            {([['Code snippet', Code2], ['Attach file', Paperclip], ['Image', Image], ['Video', Video], ['Poll', BarChart3]] as const).map(([label, Icon]) => (
              <button
                key={label}
                aria-label={label}
                title={label}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#1a1d24]"
                style={{ color: colors.verified }}
                onClick={() => setPostText((prev) => prev + ` [attach ${label}]`)}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
          <button
            className="h-9 rounded-md px-5 text-[15px] font-bold transition-all hover:brightness-110"
            style={{ background: colors.verified, color: '#000' }}
            onClick={publishPost}
          >
            Post
          </button>
        </div>
      </section>

      {/* Hashtag header */}
      {tag && (
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5" style={{ borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-2 text-[15px] font-bold" style={{ color: colors.primary }}>
            <span style={{ color: colors.verified }}>#{tag}</span>
            <span className="font-normal" style={{ color: colors.muted }}>{posts.length} posts</span>
          </div>
          <button className="text-sm font-semibold transition-colors hover:text-[#2DD4A3]" style={{ color: colors.muted }} onClick={() => navigate('/feed')}>
            Clear filter
          </button>
        </div>
      )}

      {/* Feed */}
      {posts.map((post) => (
        <article
          key={post.id}
          className="border-b px-5 py-5 cursor-pointer"
          style={{ borderColor: '#2a2a2a' }}
          onClick={() => navigate(`/post/${post.id}`)}
        >
          <div className="flex items-start gap-3">
            <img
              src={post.avatar}
              alt=""
              className="mt-1 h-11 w-11 shrink-0 rounded-full object-cover grayscale cursor-pointer"
              onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.handle.slice(1)}`); }}
            />
            <div className="min-w-0 flex-1">
              {/* Author row */}
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[15px] leading-5">
                    <h2
                      className="truncate font-bold cursor-pointer hover:underline"
                      style={{ color: colors.primary }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.handle.slice(1)}`); }}
                    >
                      {post.author}
                    </h2>
                    <span
                      className="truncate cursor-pointer hover:underline"
                      style={{ color: colors.muted }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.handle.slice(1)}`); }}
                    >
                      {post.handle}
                    </span>
                    <span style={{ color: colors.muted }}>·</span>
                    <span style={{ color: colors.muted }}>{post.age}</span>
                    <Badge status={post.status} />
                  </div>
                </div>
                <div className="relative shrink-0">
                  <button className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-[#1a1d24]" style={{ color: colors.muted }} aria-label="More actions" onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === post.id ? null : post.id); }}>
                    <MoreHorizontal size={18} />
                  </button>
                  {openMenu === post.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                      <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border py-1 shadow-xl" style={{ background: '#151515', borderColor: '#2f3336' }}>
                        <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); showToast('Link copied!', 'success'); setOpenMenu(null); }}>
                          <Share2 size={15} /> Copy link
                        </button>
                        <div className="mx-2 my-1 border-t" style={{ borderColor: '#2f3336' }} />
                        <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Marked as Interested', 'success'); setOpenMenu(null); }}>
                          <ThumbsUp size={15} /> Interested
                        </button>
                        <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Marked as Not Interested', 'success'); setOpenMenu(null); }}>
                          <ThumbsDown size={15} /> Not Interested
                        </button>
                        <div className="mx-2 my-1 border-t" style={{ borderColor: '#2f3336' }} />
                        <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Unfollowed', 'success'); setOpenMenu(null); }}>
                          <UserMinus size={15} /> Unfollow
                        </button>
                        <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Reported', 'success'); setOpenMenu(null); }}>
                          <BarChart3 size={15} /> Report post
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Impact */}
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px]">
                <span style={{ color: colors.verified }}>{post.patched}</span>
                <span style={{ color: colors.muted }}>
                  Impact: <b style={{ color: colors.primary }}>{post.impactScore}</b>
                </span>
                <span style={{ color: colors.muted }}>
                  · <b style={{ color: colors.primary }}>{post.forks}</b> forks
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
                  <button
                    key={tag}
                    className="rounded-md px-3 py-1 text-xs font-semibold transition-colors hover:bg-[#2DD4A3]/25"
                    style={{ background: 'rgba(45,212,163,0.14)', color: colors.verified }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/tag/${encodeURIComponent(tag)}`); }}
                  >
                    #{tag}
                  </button>
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
              <div className="mt-3 flex max-w-[600px] items-center gap-1 text-[13px]" onClick={(e) => e.stopPropagation()}>
                {/* Like — hover red */}
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 font-semibold transition-colors hover:text-rose-500"
                  style={{ color: liked.has(post.id) ? '#f43f5e' : colors.muted }}
                  onClick={() => toggleLiked(post.id)}
                >
                  <Heart size={17} fill={liked.has(post.id) ? '#f43f5e' : 'none'} />
                  <span>{post.likes + (liked.has(post.id) ? 1 : 0)}</span>
                </button>
                {/* Comment — hover white */}
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 font-semibold transition-colors hover:text-[#e7e9ea]"
                  style={{ color: colors.muted }}
                  onClick={() => { setReplyingTo(replyingTo === post.id ? null : post.id); setReplyText(''); }}
                >
                  <MessageCircle size={17} />
                  <span>{post.comments}</span>
                </button>
                {/* Fork — hover teal */}
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 font-semibold transition-colors hover:text-[#2DD4A3]"
                  style={{ color: colors.muted }}
                  onClick={() => navigate(`/editor/new?fork=${post.id}&title=${encodeURIComponent(post.title || post.excerpt)}&body=${encodeURIComponent(post.excerpt)}`)}
                >
                  <Repeat2 size={17} />
                  <span>{post.forks}</span>
                </button>
                {/* Save — hover white */}
                <button
                  className="flex items-center gap-1 px-2 py-1.5 text-xs transition-colors hover:text-[#e7e9ea]"
                  style={{ color: saved.has(post.id) ? '#e7e9ea' : colors.muted }}
                  onClick={() => toggleSaved(post.id)}
                >
                  <Bookmark size={15} fill={saved.has(post.id) ? '#e7e9ea' : 'none'} />
                  <span className="hidden sm:inline">{saved.has(post.id) ? 'Saved' : 'Save'}</span>
                </button>
                {/* Share — hover white */}
                <button
                  className="flex items-center gap-1 px-2 py-1.5 text-xs transition-colors hover:text-[#e7e9ea] sm:inline-flex"
                  style={{ color: colors.muted }}
                  onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); showToast('Link copied!', 'success'); }}
                >
                  <Share2 size={15} />
                  <span className="hidden sm:inline">Share</span>
                </button>
                {/* Stats — hover white */}
                <span className="flex items-center gap-1 px-1 text-xs transition-colors hover:text-[#e7e9ea]" style={{ color: colors.muted }}>
                  <BarChart3 size={14} />
                  {compactNumber(post.impressions)}
                </span>
              </div>

              {/* Inline reply */}
              {replyingTo === post.id && (
                <div className="mt-3 flex gap-3 pl-12" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    className="min-h-[40px] flex-1 resize-none rounded-lg border bg-transparent p-2 text-sm leading-5 outline-none"
                    style={{ borderColor: colors.border, color: colors.primary }}
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button
                    className="h-fit rounded-md px-4 py-1.5 text-xs font-bold transition-all hover:brightness-110"
                    style={{ background: colors.verified, color: '#000' }}
                    onClick={() => submitReply(post.id)}
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
  );
}
