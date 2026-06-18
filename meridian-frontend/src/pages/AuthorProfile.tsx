export function AuthorProfile() {
  return (
    <div className="min-h-screen">
      <div className="p-6 border-b border-surface/20">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-surface/20 rounded-full flex items-center justify-center text-2xl font-bold">
              S
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sana</h1>
              <div className="text-muted">Backend Engineer</div>
              <div className="text-accent-teal text-sm mt-1">Credibility 98%</div>
            </div>
          </div>
          <button className="px-4 py-2 border border-surface/20 rounded-pill text-sm hover:bg-surface/10 font-medium">
            Edit Profile
          </button>
        </div>

        <p className="text-muted mb-8 max-w-md">
          Writing about distributed systems, Kafka, and performance tuning. 
          Currently building high-throughput microservices.
        </p>

        {/* Placeholder for Contribution Tracker component */}
        <div className="mb-8">
          <h2 className="font-bold mb-4">412 contributions in the last year</h2>
          <div className="h-32 bg-surface/5 border border-surface/20 rounded-xl flex items-center justify-center text-muted">
            [Contribution Tracker Component]
          </div>
        </div>

        {/* Skills Graph */}
        <div className="mb-8">
          <h2 className="font-bold mb-4">Verified Skills Graph</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-surface/10 rounded-pill text-sm border border-surface/20">
              Kafka <span className="text-accent-teal ml-1">High</span>
            </span>
            <span className="px-3 py-1 bg-surface/10 rounded-pill text-sm border border-surface/20">
              PostgreSQL <span className="text-muted ml-1">Medium</span>
            </span>
          </div>
        </div>

        {/* Recruiter Toggle */}
        <div className="flex items-center justify-between p-4 bg-surface/5 rounded-xl border border-surface/20">
          <div>
            <div className="font-medium">Visible to Recruiters</div>
            <div className="text-sm text-muted">Allow recruiters to find you based on verified skills</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-surface/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
