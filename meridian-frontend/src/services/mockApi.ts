export type Post = {
  id: string;
  title: string;
  author: string;
  handle: string;
  avatar: string;
  role: string;
  age: string;
  version?: string;
  status: 'verified' | 'flagged' | 'runtime';
  patched: string;
  impactScore: number;
  excerpt: string;
  tags: string[];
  comments: number;
  forks: number;
  likes: number;
  impressions: number;
  code?: string;
  lineage?: string[];
};

export type Notification = {
  id: string;
  category: 'Patches' | 'Q&A' | 'Forks' | 'Payouts' | 'Mentions';
  title: string;
  detail: string;
  time: string;
  accent: 'verified' | 'flagged' | 'highlight' | 'muted';
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

export const fetchNotifications = async (): Promise<Notification[]> => {
  await wait();
  return [
    {
      id: 'n1',
      category: 'Patches',
      title: 'Patch accepted on io_uring event loops',
      detail: 'Sarah merged your benchmark correction into v2.4.',
      time: '12m',
      accent: 'verified',
    },
    {
      id: 'n2',
      category: 'Q&A',
      title: 'Author answered your Kubernetes CRD question',
      detail: 'The resolved answer was added to the generated FAQ.',
      time: '38m',
      accent: 'highlight',
    },
    {
      id: 'n3',
      category: 'Forks',
      title: 'Marcus forked your WASM article',
      detail: 'Attribution chain preserved. Merge suggestion pending.',
      time: '2h',
      accent: 'muted',
    },
    {
      id: 'n4',
      category: 'Payouts',
      title: 'Wallet credited for 18 work-use reactions',
      detail: '$42.80 added to this cycle from 3 posts.',
      time: '5h',
      accent: 'verified',
    },
    {
      id: 'n5',
      category: 'Patches',
      title: 'Unverified claim flagged',
      detail: 'A reader requested evidence for a latency claim.',
      time: '1d',
      accent: 'flagged',
    },
  ];
};

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
