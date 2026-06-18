import { GitFork } from 'lucide-react';

export function ForkLineage() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-8">Fork Lineage</h1>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface/20 before:to-transparent">
        {/* Origin */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-primary bg-accent-blue text-surface shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
            <GitFork className="w-4 h-4" />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-surface/20 bg-surface/5">
            <div className="flex items-center justify-between space-x-2 mb-1">
              <div className="font-bold">Original Post</div>
              <time className="font-medium text-muted text-xs">Oct 12</time>
            </div>
            <div className="text-sm text-muted">By Sana</div>
          </div>
        </div>

        {/* Fork */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-primary bg-surface/20 text-surface shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
            <GitFork className="w-4 h-4" />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-surface/20 hover:bg-surface/5 cursor-pointer transition-colors">
            <div className="flex items-center justify-between space-x-2 mb-1">
              <div className="font-bold">Kafka with Rust</div>
              <time className="font-medium text-muted text-xs">Oct 15</time>
            </div>
            <div className="text-sm text-muted">Forked by Marcus</div>
          </div>
        </div>
      </div>
    </div>
  );
}
