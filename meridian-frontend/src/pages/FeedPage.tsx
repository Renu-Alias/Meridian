import { BarChart3, Bookmark, Code2, Heart, Image, MessageCircle, MoreHorizontal, Paperclip, Repeat2, Share2, Video } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../components/Badge';
import { fetchFeed } from '../services/mockApi';
import { compactNumber } from '../utils/format';

export function FeedPage() {
  const { data: posts = [] } = useQuery({ queryKey: ['feed'], queryFn: fetchFeed });

  return (
    <div className="mx-auto max-w-3xl">
      <section className="x-post-font border-b border-surface bg-white px-4 py-3 sm:px-5">
        <div className="flex gap-3">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=120&q=80"
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
          <textarea
            className="min-h-16 flex-1 resize-none bg-transparent text-[20px] leading-6 outline-none placeholder:text-[#536471]"
            placeholder="What's the latest patch?"
            aria-label="Create a post"
          />
        </div>
        <div className="mt-3 flex items-center justify-between pl-[60px]">
          <div className="flex gap-4 text-emerald-700">
            {[Code2, Paperclip, Image, Video, BarChart3].map((Icon, index) => (
              <button key={index} aria-label="Add content" className="hover:text-black">
                <Icon size={19} />
              </button>
            ))}
          </div>
          <button className="h-9 rounded-full bg-black px-6 text-[15px] font-bold text-white hover:bg-verified hover:text-black">Post</button>
        </div>
      </section>

      <div className="bg-white">
        {posts.map((post) => (
          <article key={post.id} className="x-post-font border-b border-surface px-4 py-2.5 transition hover:bg-neutral-50 sm:px-5">
            <div className="flex items-start gap-3">
              <img src={post.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover grayscale" />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[15px] leading-5">
                      <h2 className="truncate font-bold text-[#0f1419]">{post.author}</h2>
                      <span className="truncate text-[#536471]">{post.handle}</span>
                      <span className="text-[#536471]">·</span>
                      <span className="text-[#536471]">{post.age}</span>
                      <Badge status={post.status} />
                    </div>
                  </div>
                  <button className="-mt-1 grid h-8 w-8 place-items-center rounded-full text-[#536471] hover:bg-surface hover:text-ink" aria-label="More actions">
                    <MoreHorizontal size={19} />
                  </button>
                </div>

                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px] leading-5">
                  {post.version && <span className="rounded-full bg-black px-2.5 py-0.5 font-mono text-xs font-bold text-white">{post.version}</span>}
                  <span className="font-medium text-emerald-700">{post.patched}</span>
                  <span className="text-[#536471]">
                    Impact Score: <b className="text-[#0f1419]">{post.impactScore}</b>
                  </span>
                </div>

                {post.lineage && <p className="mt-1.5 font-mono text-[11px] leading-4 text-muted">Fork lineage: {post.lineage.join(' / ')}</p>}

                <p className="x-post-body mt-1.5 max-w-[620px] text-[#0f1419]">{post.excerpt}</p>

                {post.code && (
                  <pre className="code-block thin-scrollbar mt-2.5 max-w-[620px] overflow-x-auto p-3 font-mono text-[13px] leading-5">
                    <code>{post.code}</code>
                  </pre>
                )}

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-[#536471]">
                      [{tag}]
                    </span>
                  ))}
                </div>

                <details className="mt-2.5 max-w-[620px] rounded-md border border-surface px-3 py-2 text-[13px]">
                  <summary className="cursor-pointer font-semibold">Patch history timeline</summary>
                  <ol className="mt-2 space-y-1.5 text-neutral-600">
                    <li>v2.4 accepted benchmark correction by @kernel_notes</li>
                    <li>v2.3 merged epoll fallback note by @ops-lab</li>
                  </ol>
                </details>

                <div className="mt-2.5 flex max-w-[600px] items-center justify-between text-[13px] text-[#536471]">
                  <button className="inline-flex items-center gap-2 hover:text-sky-600">
                    <MessageCircle size={18} />
                    {post.comments}
                  </button>
                  <button className="inline-flex items-center gap-2 hover:text-emerald-700">
                    <Repeat2 size={18} />
                    {post.forks}
                  </button>
                  <button className="inline-flex items-center gap-2 hover:text-rose-600">
                    <Heart size={18} />
                    {post.likes}
                  </button>
                  <button className="inline-flex items-center gap-2 hover:text-ink">
                    <Bookmark size={18} />
                    Save
                  </button>
                  <button className="hidden items-center gap-2 hover:text-sky-600 sm:inline-flex">
                    <Share2 size={18} />
                    Share
                  </button>
                  <span className="inline-flex items-center gap-2">
                    <BarChart3 size={18} />
                    {compactNumber(post.impressions)}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
