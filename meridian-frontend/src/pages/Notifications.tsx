import { MessageSquare, GitFork, GitPullRequest } from 'lucide-react';
import { clsx } from 'clsx';

export function Notifications() {
  const notifs = [
    { type: 'patch', message: 'Sana approved your patch on "Kafka Consumer Lag Tuning"', time: '2m ago', unread: true, icon: GitPullRequest },
    { type: 'fork', message: 'Marcus forked your post "Understanding React Server Components"', time: '1h ago', unread: false, icon: GitFork },
    { type: 'qa', message: 'New question on your post from Devika', time: '3h ago', unread: false, icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 bg-primary/90 backdrop-blur-sm z-10 border-b border-surface/20 px-6 py-4">
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      <div className="divide-y divide-surface/20">
        {notifs.map((n, i) => (
          <div key={i} className={clsx("p-6 flex items-start space-x-4 cursor-pointer hover:bg-surface/5 transition-colors", n.unread && "bg-surface/5")}>
            <div className="mt-1 relative">
              <n.icon className="w-5 h-5 text-muted" />
              {n.unread && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-coral rounded-full border-2 border-primary" />
              )}
            </div>
            <div>
              <p className={clsx("text-sm", n.unread ? "font-medium text-surface" : "text-muted")}>{n.message}</p>
              <div className="text-xs text-muted mt-1">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
