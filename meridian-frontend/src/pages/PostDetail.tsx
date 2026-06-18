import { Bookmark, Share2, AlertTriangle, GitFork } from 'lucide-react';

export function PostDetail() {
  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 bg-primary/90 backdrop-blur-sm z-10 border-b border-surface/20 px-6 py-4 flex items-center">
        <button className="text-muted hover:text-surface mr-4">← Back</button>
        <div className="text-sm truncate">Kafka Consumer Lag Tuning...</div>
      </div>

      <div className="p-6 relative border-l-2 border-accent-blue/50 ml-2">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Kafka Consumer Lag Tuning for High-Throughput Microservices</h1>
          <div className="flex items-center text-sm text-muted">
            <span className="font-medium text-surface">Sana</span>
            <span className="mx-2">·</span>
            <span>Published Oct 12, 2025</span>
            <span className="mx-2">·</span>
            <span className="text-accent-teal">Credibility 98%</span>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-12">
          <p>
            When dealing with high-throughput streams, consumer lag can quickly spike.
            By default, Kafka's <code>max.poll.records</code> is 500, which might not be optimal
            <sup className="text-accent-teal ml-1 cursor-pointer">[1]</sup>.
          </p>
          <pre className="bg-surface/10 p-4 rounded-xl border border-surface/20 overflow-x-auto">
            <code className="text-accent-blue">props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "1000");</code>
          </pre>
          <p>
            However, increasing this requires you to ensure your processing loop completes within
            <code>max.poll.interval.ms</code> 
            <button className="ml-2 inline-flex items-center text-accent-coral text-xs border border-accent-coral px-1 rounded-sm">
              <AlertTriangle className="w-3 h-3 mr-1" /> Flag unverified claim
            </button>
          </p>
        </div>

        {/* Reaction Bar */}
        <div className="flex items-center space-x-6 py-4 border-y border-surface/20 mb-12">
          <button className="flex items-center space-x-2 text-muted hover:text-accent-amber transition-colors">
            <Bookmark className="w-5 h-5" /> <span>Bookmark</span>
          </button>
          <button className="flex items-center space-x-2 text-muted hover:text-accent-blue transition-colors">
            <Share2 className="w-5 h-5" /> <span>Share</span>
          </button>
          <button className="flex items-center space-x-2 text-muted hover:text-surface transition-colors ml-auto">
            <GitFork className="w-5 h-5" /> <span>Fork</span>
          </button>
        </div>

        {/* Q&A Panel */}
        <section>
          <h2 className="text-xl font-bold mb-6">Q&A</h2>
          <div className="bg-surface/5 rounded-xl p-4 border border-surface/20">
            <div className="font-medium mb-2">How does this affect memory usage?</div>
            <div className="text-muted text-sm mb-4">Asked by Marcus</div>
            <div className="border-l-2 border-accent-teal pl-4 ml-2">
              <div className="text-sm font-medium mb-1">Author Answer:</div>
              <p className="text-sm">It will increase heap pressure. You must tune `-Xmx` accordingly.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
