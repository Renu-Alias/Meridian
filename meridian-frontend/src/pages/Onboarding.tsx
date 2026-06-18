import { useNavigate } from 'react-router-dom';

export function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[500px] mx-auto mt-24 p-8 border border-surface/20 rounded-2xl">
      <h1 className="text-2xl font-bold mb-2">Welcome to Meridian</h1>
      <p className="text-muted mb-8">Let's set up your stack profile.</p>

      <div className="space-y-4 mb-8">
        <button className="w-full bg-surface text-primary font-medium py-3 rounded-pill hover:opacity-90 transition-opacity">
          Connect GitHub
        </button>
        <button className="w-full bg-accent-blue text-surface font-medium py-3 rounded-pill hover:opacity-90 transition-opacity">
          Connect LinkedIn
        </button>
      </div>

      <div className="mb-8">
        <h3 className="font-medium mb-3">Or select technologies manually:</h3>
        <input 
          type="text" 
          placeholder="e.g. React, Python, PostgreSQL..." 
          className="w-full bg-transparent border border-surface/20 rounded-pill px-4 py-3 outline-none focus:border-accent-blue"
        />
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Mock chips */}
          <span className="px-3 py-1 bg-surface/10 rounded-pill text-sm flex items-center">
            React <span className="ml-2 cursor-pointer text-muted hover:text-surface">&times;</span>
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/feed')} className="text-muted hover:text-surface">
          Skip for now
        </button>
        <button onClick={() => navigate('/feed')} className="bg-surface text-primary px-6 py-2 rounded-pill font-medium hover:opacity-90">
          Continue
        </button>
      </div>
    </div>
  );
}
