export function PatchReview() {
  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Patch #42: Update max.poll.records config</h1>
        <div className="text-sm text-muted">Submitted by Devika 2 days ago</div>
      </div>

      <div className="border border-surface/20 rounded-xl overflow-hidden mb-8">
        <div className="bg-surface/5 px-4 py-2 border-b border-surface/20 text-sm font-medium">
          Diff Viewer
        </div>
        <div className="p-4 font-mono text-sm overflow-x-auto whitespace-pre">
          <div className="text-accent-coral/80">- props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "500");</div>
          <div className="text-accent-teal/80">+ props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "1000");</div>
        </div>
      </div>

      <div className="flex space-x-4 mb-8">
        <button className="bg-surface text-primary px-6 py-2 rounded-pill font-medium hover:opacity-90">Approve</button>
        <button className="border border-surface/20 px-6 py-2 rounded-pill font-medium hover:bg-surface/10">Request Changes</button>
        <button className="border border-accent-coral text-accent-coral px-6 py-2 rounded-pill font-medium hover:bg-accent-coral/10">Reject</button>
      </div>
    </div>
  );
}
