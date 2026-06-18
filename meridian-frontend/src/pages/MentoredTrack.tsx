import { CheckCircle2, Clock } from 'lucide-react';

export function MentoredTrack() {
  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-accent-amber">Mentored Track</h1>
        <button className="px-4 py-2 border border-surface/20 rounded-pill text-sm hover:bg-surface/10">
          Become a Mentor
        </button>
      </div>

      <p className="text-muted mb-8">
        Submit your drafts to get expert feedback from senior engineers before publishing.
      </p>

      {/* Submissions Queue */}
      <div className="mb-12">
        <h2 className="font-bold mb-4">Your Submissions</h2>
        <div className="space-y-4">
          <div className="p-4 border border-accent-amber/50 bg-accent-amber/5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">My first Rust macro</h3>
              <span className="px-2 py-1 bg-accent-amber/20 text-accent-amber rounded-pill text-xs font-medium flex items-center">
                <Clock className="w-3 h-3 mr-1" /> In Review
              </span>
            </div>
            <div className="text-sm text-muted">
              Matched with Mentor: <span className="font-medium text-surface">Marcus</span>
            </div>
            <div className="mt-4 pt-4 border-t border-surface/10 flex space-x-3">
              <button className="text-sm text-accent-blue hover:underline">View Feedback</button>
            </div>
          </div>

          <div className="p-4 border border-surface/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Understanding React Server Components</h3>
              <span className="px-2 py-1 bg-accent-teal/20 text-accent-teal rounded-pill text-xs font-medium flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Published
              </span>
            </div>
            <div className="text-sm text-muted">
              Mentored by: <span className="font-medium text-surface">Sana</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
