export type Post = {
  id: string;
  title: string;
  author: string;
  handle: string;
  avatar: string;
  role: string;
  age: string;
  date?: string;
  version?: string;
  status: 'verified' | 'flagged' | 'runtime';
  patched: string;
  impactScore: number;
  excerpt: string;
  body?: string;
  tags: string[];
  comments: number;
  forks: number;
  likes: number;
  impressions: number;
  code?: string;
  lineage?: string[];
  coverImage?: string;
};

export type Notification = {
  id: string;
  category: 'Patches' | 'Q&A' | 'Forks' | 'Payouts' | 'Mentions';
  title: string;
  detail: string;
  time: string;
  accent: 'verified' | 'flagged' | 'highlight' | 'muted';
  is_read?: boolean;
  created_at?: string;
};

const wait = (ms = 220) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const posts: Post[] = [
  {
    id: 'io-uring-loop',
    title: 'Refactoring a Rust event loop around io_uring',
    author: 'Sarah Chen',
    handle: '@schen_dev',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=80',
    role: 'Principal Systems Engineer',
    age: '2h ago',
    version: 'v2.4',
    status: 'verified',
    patched: 'Patched 2h ago',
    impactScore: 842,
    excerpt:
      'Refactored the core event loop to utilize io_uring for asynchronous I/O operations. Reduced latency by 42% on high-concurrency benchmarks.',
    tags: ['Rust', 'Distributed Systems', 'Linux Kernel'],
    comments: 124,
    forks: 45,
    likes: 892,
    impressions: 12400,
    lineage: ['polling loops', 'epoll guide', 'io_uring loop'],
    code: `pub async fn poll_events(&mut self) -> Result<(), Error> {\n    let mut ring = IoUring::new(256)?;\n    loop {\n        self.flush_completions(&mut ring).await?;\n    }\n}`,
  },
  {
    id: 'meridian-cli',
    title: 'Shipping the first iteration of Meridian CLI',
    author: 'Marcus Thorne',
    handle: '@mthorne_ops',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80',
    role: 'Staff Platform Engineer',
    age: '5h ago',
    version: 'v1.0-rc',
    status: 'runtime',
    patched: 'Initial Deploy',
    impactScore: 1205,
    excerpt:
      'The CLI automates technical debt discovery across multi-repo microservices using static analysis and LLM-driven heuristics.',
    tags: ['Go', 'Wasm', 'Static Analysis'],
    comments: 89,
    forks: 12,
    likes: 561,
    impressions: 8200,
  },
  {
    id: 'raft-go',
    title: 'Implementing Raft from scratch in 500 lines of Go',
    author: 'Lyn Park',
    handle: '@lynx_dev',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
    role: 'Backend Engineer',
    age: '4h ago',
    status: 'verified',
    patched: 'Fresh',
    impactScore: 1472,
    excerpt:
      'A deep dive into the consensus algorithm that powers ETCD, focused on safety properties and leader election cycles.',
    tags: ['Go', 'Kubernetes', 'Consensus'],
    comments: 84,
    forks: 31,
    likes: 1200,
    impressions: 18400,
  },
];

export const fetchPost = async (id: string) => {
  await wait();
  const post = posts.find((p) => p.id === id);
  if (!post) throw new Error('Post not found');
  return post;
};

export const fetchFeed = async () => {
  await wait();
  return posts;
};

export const fetchDiscover = async () => {
  await wait();
  return {
    featured: posts[2],
    cards: [
      {
        title: 'The Cost of Zero-Knowledge Proofs in Production',
        status: 'Runtime Verified',
        ripples: 428,
        image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'eBPF: A New Frontier for Observability',
        status: 'Verified Claims',
        ripples: 912,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      },
    ],
    trending: [
      ['v1.24.0 Security Hotfix: OpenSSL Buffer Overflow', '+2.4k%'],
      ['Optimizing React Re-renders in Large Lists', '+1.1k%'],
    ],
    mentors: [
      ['Sarah Drasner', 'Distinguished Engineer', 'Vue.js', 'SVG'],
      ['Dan Abramov', 'React Core Team', 'React', 'JS'],
      ['Parisa Tabriz', 'VP of Engineering', 'Security', 'Chrome'],
    ],
  };
};

const now = Date.now();
const isoAgo = (mins: number) => new Date(now - mins * 60_000).toISOString();
const timeAgo = (mins: number): string => {
  if (mins < 60) return `${mins}m`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h`;
  if (mins < 60 * 24 * 7) return `${Math.round(mins / (60 * 24))}d`;
  return `${Math.round(mins / (60 * 24 * 7))}w`;
};

let fakeId = 0;
function fakeNotification(
  category: Notification['category'],
  title: string,
  detail: string,
  minsAgo: number,
  accent: Notification['accent'],
  is_read: boolean,
): Notification {
  fakeId += 1;
  return {
    id: `fake-${fakeId}`,
    category,
    title,
    detail,
    time: timeAgo(minsAgo),
    accent,
    is_read,
    created_at: isoAgo(minsAgo),
  };
}

/**
 * Demo notification feed for the Activity Center. Generates realistic items
 * across every category (Patches, Q&A, Forks, Payouts, Mentions) with varied
 * recency so the Unread / Today / This Week / Older filters all show results.
 *
 * The volume is scaled to the user's actual activity: forks, patches, mentions,
 * Q&A questions and payouts all require the user to have published posts, so a
 * brand-new user with no posts gets no demo notifications at all.
 */
export function generateFakeNotifications(postCount: number): Notification[] {
  fakeId = 0;
  const feed: Notification[] = [
    fakeNotification('Patches', 'Patch accepted on io_uring event loops', 'Sarah merged your benchmark correction into v2.4.', 12, 'verified', false),
    fakeNotification('Mentions', 'Sarah Chen mentioned you in a comment', 'You were tagged in a discussion on \'Refactoring a Rust event loop around io_uring\'. Check what they said.', 26, 'muted', false),
    fakeNotification('Q&A', 'Author answered your Kubernetes CRD question', 'The resolved answer was added to the generated FAQ.', 38, 'highlight', false),
    fakeNotification('Payouts', 'Wallet credited for 18 work-use reactions', '$42.80 added to this cycle from 3 posts.', 300, 'verified', false),
    fakeNotification('Forks', 'Marcus forked your WASM article', 'Attribution chain preserved. Merge suggestion pending.', 120, 'muted', false),
    fakeNotification('Patches', 'New patch waiting for review', 'Lyn Park submitted a patch to \'Refactoring a Rust event loop around io_uring\'. Review it when you\'re ready.', 180, 'verified', false),
    fakeNotification('Q&A', 'New question on your post', 'A reader wants to know more about \'Refactoring a Rust event loop around io_uring\'. Check the comments.', 300, 'highlight', false),
    fakeNotification('Mentions', '@lynx_dev referenced your work', 'Someone cited \'Implementing Raft from scratch in 500 lines of Go\' in a comment thread. Your post got noticed.', 480, 'muted', false),
    fakeNotification('Patches', 'Patch merged: Kubernetes CRD migration notes', '\'Optimizing React Re-renders in Large Lists\' was updated with a merged patch from Marcus Thorne.', 1440, 'verified', true),
    fakeNotification('Forks', 'Fork created from your post', 'Lyn Park extended \'Optimizing React Re-renders in Large Lists\' with a fork. Your contribution was credited.', 1440, 'muted', true),
    fakeNotification('Q&A', 'Reader question: how does this hold up under network partitions?', 'Sarah Chen is asking about \'Implementing Raft from scratch in 500 lines of Go\'.', 2880, 'highlight', true),
    fakeNotification('Mentions', 'You were mentioned by Marcus Thorne', '\'Shipping the first iteration of Meridian CLI\' came up in a conversation — Marcus Thorne brought you in.', 4320, 'muted', true),
    fakeNotification('Forks', 'Your post was forked', 'Sarah Chen forked your post and is building on your work. Attribution chain preserved.', 5760, 'muted', true),
    fakeNotification('Patches', 'Unverified claim flagged', 'A reader requested evidence for a latency claim on \'Implementing Raft from scratch in 500 lines of Go\'.', 11520, 'flagged', true),
    fakeNotification('Payouts', 'Wallet credited $3.15', 'Earned $3.15 from bookmarks, internal shares, and Used This At Work reactions on \'eBPF: A New Frontier for Observability\'.', 12960, 'verified', true),
    fakeNotification('Payouts', 'Payout cycle complete', 'Your latest earnings of $87.40 are on the way. See the wallet breakdown.', 17280, 'verified', true),
  ];

  if (postCount <= 0) return [];
  if (postCount === 1) return feed.slice(0, 3);
  if (postCount <= 3) return feed.slice(0, 6);
  if (postCount <= 6) return feed.slice(0, 10);
  return feed;
}

export const fetchWallet = async () => {
  await wait();
  return {
    balance: 824.36,
    pending: 186.4,
    paid: 3402.75,
    trend: [42, 54, 49, 88, 91, 124, 118, 160, 176, 203, 230, 262],
    breakdown: [
      ['Refactoring a Rust event loop around io_uring', 342.2, 126, 48, 82],
      ['Implementing Raft from scratch in 500 lines of Go', 226.9, 98, 41, 66],
      ['eBPF: A New Frontier for Observability', 144.7, 74, 20, 38],
    ],
  };
};

export const fetchProfile = async () => {
  await wait();
  return {
    name: 'Alex Rivera',
    handle: '@arivera.dev',
    designation: 'Backend Platform Engineer',
    bio: 'Writes about distributed systems, observability, and the sharp edges between product velocity and operational truth.',
    joined: 'Joined March 2024',
    credibility: 94,
    stack: ['Python', 'Kubernetes', 'AWS', 'PostgreSQL', 'Rust', 'OpenTelemetry'],
    skills: [
      ['Kubernetes', 92],
      ['Python', 88],
      ['Distributed Systems', 81],
      ['Observability', 74],
      ['Rust', 58],
    ],
  };
};
