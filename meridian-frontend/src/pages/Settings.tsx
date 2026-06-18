export function Settings() {
  return (
    <div className="min-h-screen p-6 pb-20">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <div className="space-y-12">
        <section>
          <h2 className="font-bold text-lg mb-4">Account</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-surface/20 rounded-xl">
              <div>
                <div className="font-medium">GitHub</div>
                <div className="text-sm text-muted">Connected as @sana-dev</div>
              </div>
              <button className="text-sm border border-surface/20 px-4 py-1.5 rounded-pill hover:bg-surface/10">Disconnect</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-surface/20 rounded-xl">
              <div>
                <div className="font-medium">LinkedIn</div>
                <div className="text-sm text-muted">Not connected</div>
              </div>
              <button className="text-sm bg-surface text-primary px-4 py-1.5 rounded-pill font-medium hover:opacity-90">Connect</button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-4">Payouts</h2>
          <div className="p-4 border border-surface/20 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-medium">Stripe Connect</div>
                <div className="text-sm text-muted">Active and verified</div>
              </div>
              <div className="text-accent-teal text-sm font-medium">✓ Verified</div>
            </div>
            <button className="text-sm border border-surface/20 px-4 py-1.5 rounded-pill hover:bg-surface/10 w-full">
              Manage Payout Account
            </button>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-4 text-accent-coral">Danger Zone</h2>
          <div className="p-4 border border-accent-coral/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-accent-coral">Delete Account</div>
                <div className="text-sm text-muted">Permanently delete your account and all data</div>
              </div>
              <button className="text-sm border border-accent-coral text-accent-coral px-4 py-1.5 rounded-pill hover:bg-accent-coral/10">
                Delete
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
