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

const AVATAR_IMG = (index: number) => `https://i.pravatar.cc/900?img=${(index % 70) + 1}`;

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
  return {
    id: p.id,
    title: p.title,
    author: p.author.display_name,
    handle: `@${p.author.username}`,
    avatar: p.author.avatar_url || AVATAR_IMG(0),
    role: '',
    age: relativeTime(p.published_at || p.created_at),
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
      avatar: person.avatar_url || AVATAR_IMG(0),
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
  credibility: number;
  stack: string[];
  skills: [string, number][];
  avatar: string;
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
    credibility: Math.round(p.credibility?.score ?? 100),
    stack: (u.stack ?? []).map((s) => s.technology),
    skills: (p.skills ?? []).map((s) => [s.skill_name, Math.round(s.depth)] as [string, number]),
    avatar: u.avatar_url || AVATAR_IMG(0),
  };
}

export type Card = { title: string; status: string; ripples: number; image: string };
export type TrendingRow = { title: string; growth: string; author: string; forks: number };
export type MentorRow = [string, string, string, string];

export type DiscoverShape = {
  featured: Post | null;
  cards: Card[];
  trending: TrendingRow[];
  mentors: MentorRow[];
};

export function toDiscover(d: ApiDiscover): DiscoverShape {
  const featured = d.featured ? toPost(d.featured) : null;
  const cards: Card[] = d.trending.slice(0, 2).map((p, i) => ({
    title: p.title,
    status: p.citations.length > 0 ? 'Verified Claims' : 'Runtime Verified',
    ripples: p.impact_score ?? 0,
    image: AVATAR_IMG((p.impact_score ?? 0) + i * 7),
  }));
  const trending: TrendingRow[] = d.trending.map((p) => ({
    title: p.title,
    growth: `+${((p.impact_score ?? 0) / 100).toFixed(1)}k%`,
    author: p.author.username,
    forks: p.fork_count ?? 0,
  }));
  const mentors: MentorRow[] = d.mentors.map((m) => [
    m.display_name,
    'Mentor',
    m.stack?.[0] || 'Engineering',
    m.stack?.[1] || 'Leadership',
  ]);
  return { featured, cards, trending, mentors };
}
