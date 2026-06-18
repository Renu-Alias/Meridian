import { ArrowUpRight } from 'lucide-react';

export function Wallet() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-8">Earnings Dashboard</h1>

      {/* Balance Card */}
      <div className="bg-surface/5 border border-surface/20 rounded-2xl p-6 mb-8">
        <div className="text-muted text-sm mb-2">Available Balance</div>
        <div className="text-4xl font-bold mb-6">$342.50</div>
        <button className="bg-surface text-primary px-6 py-2 rounded-pill font-medium hover:opacity-90">
          Request Payout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border border-surface/20 rounded-xl p-4">
          <div className="text-sm text-muted mb-1">Total Impact Reactions</div>
          <div className="text-2xl font-bold">1.2k</div>
        </div>
        <div className="border border-surface/20 rounded-xl p-4">
          <div className="text-sm text-muted mb-1">Top Earning Post</div>
          <div className="text-sm font-medium truncate">Kafka Consumer Lag Tuning...</div>
          <div className="text-accent-teal text-sm mt-1">$124.00</div>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 border border-surface/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-surface/10 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-accent-teal" />
                </div>
                <div>
                  <div className="font-medium">Impact Earnings</div>
                  <div className="text-sm text-muted">Oct 12, 2025</div>
                </div>
              </div>
              <div className="font-bold text-accent-teal">+$12.50</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
