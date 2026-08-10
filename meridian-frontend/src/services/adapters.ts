import type {
  ApiDiscover,
  ApiNotification,
  ApiPost,
  ApiProfile,
  ApiQA,
  ApiTransaction,
  ApiWallet,
} from './api';
import type { Notification, Post } from './mockApi';

/** Deterministic initials monogram for users without an uploaded avatar. */
export function initialsAvatar(name: string): string {
  const parts = (name || '?').trim().split(/\s+/).filter(Boolean);
  const initials = (
    parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? '?')
  ).toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">` +
    `<rect width="150" height="150" rx="75" fill="#151515"/>` +
    `<text x="50%" y="50%" dy=".35em" text-anchor="middle" ` +
    `font-family="Segoe UI, Arial, sans-serif" font-size="56" font-weight="700" fill="#2DD4A3">${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Avatar URL, falling back to an initials monogram when none is set. */
export const avatarFor = (name: string, url?: string): string => url || initialsAvatar(name);

// Stable Unsplash engineering imagery, keyed by theme. Each URL maps to a
// fixed, topic-relevant photo so post covers no longer render random images.
const THEME_IMG: Record<string, string> = {
  code:    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
  systems: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
  web:     'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  laptop:  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
  cloud:   'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  server:  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  ai:      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
  network: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
  circuit: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  ops:     'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
};

/** Map a technology tag to the most contextually relevant theme image. */
const TAG_THEME: Record<string, string> = {
  Rust:           'systems',
  'Linux Kernel': 'systems',
  eBPF:           'systems',
  Elixir:         'systems',
  Go:             'web',
  Python:         'laptop',
  TypeScript:     'code',
  React:          'web',
  'Next.js':      'web',
  GraphQL:        'code',
  WebRTC:         'network',
  LLM:            'ai',
  PyTorch:        'ai',
  Kubernetes:     'cloud',
  Docker:         'cloud',
  Terraform:      'cloud',
  AWS:            'cloud',
  GCP:            'cloud',
  Azure:          'cloud',
  PostgreSQL:     'server',
  Redis:          'server',
  Kafka:          'server',
  Prometheus:     'server',
  Grafana:        'server',
};

const FALLBACK_THEMES = ['code', 'server', 'cloud', 'circuit', 'web', 'network', 'ai', 'ops'];

const hashString = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

function topicImageUrl(tags: string[], seed: number): string {
  const tag = tags.find((t) => TAG_THEME[t]) ?? tags[0];
  if (tag && TAG_THEME[tag]) return THEME_IMG[TAG_THEME[tag]];
  const key = (tag ?? 'engineering').toLowerCase().replace(/[^a-z0-9]/g, '');
  const theme = FALLBACK_THEMES[(hashString(key) + seed) % FALLBACK_THEMES.length];
  return THEME_IMG[theme];
}

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

export function toPost(p: ApiPost): Post {
  const counts = p.reaction_counts || {};
  const hasCover = (p.body?.includes('```') ?? false) || p.tags.length >= 2;
  return {
    id: p.id,
    title: p.title,
    author: p.author.display_name,
    handle: `@${p.author.username}`,
    avatar: avatarFor(p.author.display_name, p.author.avatar_url),
    role: '',
    age: relativeTime(p.published_at || p.created_at),
    date: p.published_at || p.created_at || '',
    version: p.version,
    status: p.flagged ? 'flagged' : p.citations.length > 0 ? 'verified' : 'runtime',
    patched:
      p.updated_at && p.updated_at !== p.created_at ? `Patched ${relativeTime(p.updated_at)}` : 'Fresh',
    impactScore: p.impact_score ?? 0,
    excerpt: p.excerpt || truncate(p.body, 200),
    body: p.body,
    tags: p.tags,
    comments: p.comment_count ?? 0,
    forks: p.fork_count ?? 0,
    likes: counts.upvote ?? 0,
    impressions: (p.impact_score ?? 0) * 13 + (p.comment_count ?? 0) * 25,
    coverImage: hasCover ? topicImageUrl(p.tags, p.impact_score ?? 0) : undefined,
  };
}

const CATEGORY_ACCENT: Record<string, Notification['accent']> = {
  Patches: 'verified',
  Payouts: 'verified',
  'Q&A': 'highlight',
  Forks: 'muted',
  Mentions: 'muted',
};

const NOTIFICATION_CATEGORIES: Notification['category'][] = ['Patches', 'Q&A', 'Forks', 'Payouts', 'Mentions'];

export function toNotification(n: ApiNotification): Notification {
  const category = NOTIFICATION_CATEGORIES.includes(n.category as Notification['category'])
    ? (n.category as Notification['category'])
    : 'Mentions';
  return {
    id: n.id,
    category,
    title: n.title,
    detail: n.detail,
    time: relativeTime(n.created_at),
    accent: CATEGORY_ACCENT[n.category] ?? 'muted',
    is_read: n.is_read,
    created_at: n.created_at,
  };
}

export type Comment = {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  body: string;
  time: string;
  likes: number;
};

export function toComments(threads: ApiQA[]): Comment[] {
  return threads.map((t) => {
    const person = t.answerer ?? t.questioner;
    return {
      id: t.id,
      author: t.answerer ? t.answerer.display_name : t.questioner.display_name,
      handle: `@${person.username}`,
      avatar: avatarFor(person.display_name, person.avatar_url),
      body: t.answer || t.question,
      time: relativeTime(t.answered_at || t.created_at),
      likes: 0,
    };
  });
}

export type WalletShape = {
  balance: number;
  pending: number;
  paid: number;
  trend: number[];
  breakdown: [string, number, number, number, number][];
};

const extractTitle = (t: ApiTransaction): string => {
  const m = t.description.match(/['"]([^'"]+)['"]/);
  if (m && m[1]) return m[1];
  if (t.description) return truncate(t.description, 60);
  return 'Post earnings';
};

export function toWallet(w: ApiWallet): WalletShape {
  const MONTHS = 12;
  const now = new Date();
  const buckets: number[] = Array(MONTHS).fill(0);
  for (const t of w.transactions) {
    const d = new Date(t.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    const idx = MONTHS - 1 - diffMonths;
    if (idx >= 0 && idx < MONTHS) buckets[idx] += t.amount;
  }
  const trend = buckets.map(
    (_, i) => Math.round(buckets.slice(0, i + 1).reduce((a, b) => a + b, 0) * 100) / 100,
  );

  const byPost = new Map<
    string,
    { title: string; earnings: number; bookmark: number; share: number; used: number }
  >();
  for (const t of w.transactions) {
    const key = t.post_id ?? extractTitle(t);
    const title = extractTitle(t);
    const row = byPost.get(key) ?? { title, earnings: 0, bookmark: 0, share: 0, used: 0 };
    row.earnings += t.amount;
    if (t.transaction_type === 'bookmark') row.bookmark += 1;
    else if (t.transaction_type === 'share_internal') row.share += 1;
    else if (t.transaction_type === 'used_at_work') row.used += 1;
    byPost.set(key, row);
  }
  const breakdown: WalletShape['breakdown'] = [...byPost.values()]
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 10)
    .map((r) => [r.title, Math.round(r.earnings * 100) / 100, r.bookmark, r.share, r.used]);

  return {
    balance: w.balance ?? 0,
    pending: w.pending ?? 0,
    paid: w.lifetime_paid ?? 0,
    trend,
    breakdown,
  };
}

export type ProfileShape = {
  name: string;
  handle: string;
  designation: string;
  bio: string;
  joined: string;
  created_at: string;
  credibility: number;
  stack: string[];
  skills: [string, number][];
  avatar: string;
  github: string | null;
  linkedin: string | null;
  followers_count: number;
  following_count: number;
  is_following: boolean;
};

export function toProfile(p: ApiProfile): ProfileShape {
  const u = p.user;
  const joined = new Date(u.created_at);
  return {
    name: u.display_name,
    handle: `@${u.username}`,
    designation: u.role || u.seniority || 'Engineer',
    bio: u.bio || '',
    joined: Number.isNaN(joined.getTime())
      ? ''
      : `Joined ${joined.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
    created_at: u.created_at,
    credibility: Math.round(p.credibility?.score ?? 100),
    stack: (u.stack ?? []).map((s) => s.technology),
    skills: (p.skills ?? []).map((s) => [s.skill_name, Math.round(s.depth)] as [string, number]),
    avatar: avatarFor(u.display_name, u.avatar_url),
    github: u.github_username || null,
    linkedin: u.linkedin_username || null,
    followers_count: p.followers_count ?? 0,
    following_count: p.following_count ?? 0,
    is_following: !!p.is_following,
  };
}

export type Card = { id: string; title: string; status: string; ripples: number; image: string };
export type TrendingRow = { id: string; title: string; growth: string; author: string; forks: number };
export type MentorRow = {
  id: string;
  username: string;
  name: string;
  role: string;
  tags: [string, string];
  avatar: string;
};

export type DiscoverShape = {
  featured: Post | null;
  cards: Card[];
  trending: TrendingRow[];
  mentors: MentorRow[];
};

export function toDiscover(d: ApiDiscover): DiscoverShape {
  const featured = d.featured ? toPost(d.featured) : null;
  const cards: Card[] = d.trending.slice(0, 2).map((p, i) => ({
    id: p.id,
    title: p.title,
    status: p.citations.length > 0 ? 'Verified Claims' : 'Runtime Verified',
    ripples: p.impact_score ?? 0,
    image: topicImageUrl(p.tags, (p.impact_score ?? 0) + i * 13),
  }));
  const trending: TrendingRow[] = d.trending.map((p) => ({
    id: p.id,
    title: p.title,
    growth: `+${((p.impact_score ?? 0) / 100).toFixed(1)}k%`,
    author: p.author.username,
    forks: p.fork_count ?? 0,
  }));
  const mentors: MentorRow[] = d.mentors.map((m) => ({
    id: m.id,
    username: m.username,
    name: m.display_name,
    role: 'Mentor',
    tags: [m.stack?.[0] || 'Engineering', m.stack?.[1] || 'Leadership'],
    avatar: avatarFor(m.display_name, m.avatar_url),
  }));
  return { featured, cards, trending, mentors };
}
