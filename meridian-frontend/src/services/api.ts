const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> | undefined) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || 'Request failed');
  }
  return res.json();
}

const queryString = (params: Record<string, string | number | undefined>) => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
};

export type AuthorBrief = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
};

export type ApiPost = {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  author: AuthorBrief;
  tags: string[];
  status: string;
  version: string;
  fork_of_id: string | null;
  is_mentored: boolean;
  impact_score: number;
  flagged: boolean;
  citations: { id: string; anchor_text: string; url: string; citation_type: string }[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
  comment_count: number;
  fork_count: number;
  reaction_counts: Record<string, number>;
};

export type FeedResponse = { total: number; offset: number; limit: number; items: ApiPost[] };

export type ApiNotification = {
  id: string;
  category: string;
  title: string;
  detail: string;
  link: string;
  is_read: boolean;
  created_at: string;
};

export type NotificationsResponse = {
  total: number;
  offset: number;
  limit: number;
  items: ApiNotification[];
};

export type ApiTransaction = {
  id: string;
  post_id: string | null;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
};

export type ApiWallet = {
  id: string;
  balance: number;
  pending: number;
  lifetime_paid: number;
  transactions: ApiTransaction[];
  updated_at: string;
};

export type ApiQA = {
  id: string;
  post_id: string;
  questioner: AuthorBrief;
  question: string;
  answer: string;
  answerer: AuthorBrief | null;
  is_answered: boolean;
  created_at: string;
  answered_at: string | null;
};

export type ApiProfile = {
  user: {
    id: string;
    email: string;
    username: string;
    display_name: string;
    bio: string;
    avatar_url: string;
    role: string;
    seniority: string;
    github_username: string | null;
    linkedin_username: string | null;
    recruiter_visible: boolean;
    is_mentor: boolean;
    created_at: string;
    stack: { technology: string }[];
    followers_count: number;
    following_count: number;
  };
  skills: { skill_name: string; depth: number; source: string }[];
  credibility: { score: number; verified_claims: number; flagged_claims: number; resolved_flags: number };
  followers_count: number;
  following_count: number;
  is_following: boolean;
};

export type ApiFollowStatus = {
  detail: string;
  is_following: boolean;
  followers_count: number;
};

export type ApiDiscover = {
  featured: ApiPost | null;
  trending: ApiPost[];
  mentors: { id: string; display_name: string; username: string; bio: string; avatar_url: string; stack: string[] }[];
};

export type ApiSearchUser = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  role: string;
  seniority: string;
  bio: string;
  stack: string[];
};

export type ApiSearchTopic = { name: string; category: string; count: number };

export type ApiSuggestion = {
  topics: ApiSearchTopic[];
  users: ApiSearchUser[];
  posts: { id: string; title: string; excerpt: string; author: AuthorBrief; tags: string[] }[];
};

export type ApiRankAuthor = {
  user_id: string;
  credibility_score: number;
  verified_claims: number;
  username: string;
  display_name: string;
  avatar_url: string;
  stack: string[];
};

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string; user_id: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, username: string, display_name: string, password: string) =>
    request<{ access_token: string; token_type: string; user_id: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, display_name, password }),
    }),

  getMe: () =>
    request<{ id: string; email: string; username: string; display_name: string; avatar_url: string; bio: string; created_at: string }>(
      '/auth/me',
    ),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ avatar_url: string }>('/users/me/avatar', {
      method: 'POST',
      body: form,
    });
  },

  removeAvatar: () => request<{ avatar_url: string }>('/users/me/avatar', { method: 'DELETE' }),

  getFeed: (opts: { filter?: string; tag?: string; offset?: number; limit?: number } = {}) =>
    request<FeedResponse>(`/feed${queryString({ filter: opts.filter, tag: opts.tag, offset: opts.offset, limit: opts.limit })}`),

  searchPosts: (q: string, limit = 20) =>
    request<FeedResponse>(`/search/posts${queryString({ q, limit })}`),

  searchUsers: (q: string, limit = 20) =>
    request<ApiSearchUser[]>(`/search/users${queryString({ q, limit })}`),

  searchTopics: (q: string, limit = 20) =>
    request<ApiSearchTopic[]>(`/search/topics${queryString({ q, limit })}`),

  suggest: (q: string, limit = 5) =>
    request<ApiSuggestion>(`/search/suggest${queryString({ q, limit })}`),

  getStack: () => request<{ technology: string }[]>(`/users/me/stack`),

  updateStack: (technologies: string[]) =>
    request<{ technology: string }[]>(`/users/me/stack`, {
      method: 'PUT',
      body: JSON.stringify({ technologies }),
    }),

  getTechnologies: () =>
    request<{ id: string; name: string; category: string }[]>(`/users/technologies`),

  getDiscover: () => request<ApiDiscover>('/feed/discover'),

  getPost: (id: string) => request<ApiPost>(`/posts/${id}`),

  getQA: (postId: string) => request<ApiQA[]>(`/posts/${postId}/qa`),

  askQuestion: (postId: string, question: string) =>
    request<ApiQA>(`/posts/${postId}/qa`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),

  addReaction: (postId: string, reactionType: string) =>
    request<{ detail: string; active?: boolean; count?: number }>(
      `/posts/${postId}/reactions${queryString({ reaction_type: reactionType })}`,
      { method: 'POST' },
    ),

  createPost: (payload: { title: string; body: string; excerpt?: string; tags?: string[] }) =>
    request<ApiPost>('/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  publishPost: (id: string) => request<ApiPost>(`/posts/${id}/publish`, { method: 'POST' }),

  updatePost: (id: string, payload: { title?: string; body?: string; excerpt?: string; tags?: string[] }) =>
    request<ApiPost>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  forkPost: (postId: string) => request<ApiPost>(`/posts/${postId}/fork`, { method: 'POST' }),

  getNotifications: (opts: { category?: string; offset?: number; limit?: number } = {}) =>
    request<NotificationsResponse>(
      `/notifications${queryString({ category: opts.category, offset: opts.offset, limit: opts.limit })}`,
    ),

  markNotificationRead: (id: string) =>
    request<{ detail: string }>(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllNotificationsRead: () =>
    request<{ detail: string }>('/notifications/read-all', { method: 'PUT' }),

  getWallet: () => request<ApiWallet>('/wallet'),

  requestPayout: (amount?: number) =>
    request<{ detail: string; amount?: number; balance?: number }>(
      `/wallet/payout${queryString({ amount })}`,
      { method: 'POST' },
    ),

  getProfile: (username: string) => request<ApiProfile>(`/users/profile/${username}`),

  followUser: (username: string) =>
    request<ApiFollowStatus>(`/users/profile/${username}/follow`, { method: 'POST' }),

  unfollowUser: (username: string) =>
    request<ApiFollowStatus>(`/users/profile/${username}/follow`, { method: 'DELETE' }),

  getProfilePosts: (username: string) =>
    request<ApiPost[]>(`/users/profile/${username}/posts`),

  getRankingAuthors: (limit = 100) =>
    request<ApiRankAuthor[]>(`/ranking/authors${queryString({ limit })}`),

  deleteAccount: () => request<{ detail: string }>('/account/delete', { method: 'DELETE' }),
};
