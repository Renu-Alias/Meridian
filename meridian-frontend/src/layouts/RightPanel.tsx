export function RightPanel() {
  return (
    <div className="sticky top-0 h-screen py-6 px-8 flex flex-col space-y-8">
      {/* Search */}
      <div>
        <input 
          type="text" 
          placeholder="Search Meridian..." 
          className="w-full bg-surface/10 text-surface placeholder:text-muted rounded-pill px-5 py-2.5 outline-none focus:ring-1 focus:ring-accent-blue transition-all border border-transparent focus:border-accent-blue"
        />
      </div>

      {/* Active Stack Profile Summary */}
      <div className="border border-surface/20 rounded-2xl p-5">
        <h3 className="font-medium text-lg mb-4">Your Stack</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {['React', 'TypeScript', 'Node.js', 'PostgreSQL'].map(tech => (
            <span key={tech} className="px-3 py-1 bg-surface/10 text-surface rounded-pill text-sm border border-surface/10">
              {tech}
            </span>
          ))}
        </div>
        <button className="text-accent-blue text-sm hover:underline">
          Edit stack profile
        </button>
      </div>

      {/* Trending Technologies */}
      <div className="border border-surface/20 rounded-2xl p-5">
        <h3 className="font-medium text-lg mb-4">Trending Tech</h3>
        <div className="space-y-4">
          {[
            { name: 'Kafka', posts: 124 },
            { name: 'Rust', posts: 89 },
            { name: 'FastAPI', posts: 56 }
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center cursor-pointer group">
              <div>
                <div className="text-sm text-muted">Trending in Backend</div>
                <div className="font-medium group-hover:text-accent-blue transition-colors">{item.name}</div>
              </div>
              <div className="text-sm text-muted">{item.posts} posts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
