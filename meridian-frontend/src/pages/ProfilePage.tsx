import { Github, Globe, Linkedin, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ContributionGrid } from '../components/ContributionGrid';
import { fetchProfile } from '../services/mockApi';

function ProfileContent() {
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });
  if (!profile) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="space-y-6">
      <section className="border border-surface bg-white p-5">
        <div className="flex flex-col gap-6 sm:flex-row">
          <img
            src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80"
            alt=""
            className="h-24 w-24 rounded-full object-cover grayscale"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black">{profile.name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-verified px-3 py-1 text-sm font-bold">
                <ShieldCheck size={16} />
                {profile.credibility}% credible
              </span>
            </div>
            <p className="mt-1 text-neutral-500">
              {profile.handle} · {profile.designation}
            </p>
            <p className="mt-4 max-w-2xl leading-7">{profile.bio}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-neutral-500">
              <Github size={19} />
              <Linkedin size={19} />
              <Globe size={19} />
              <span>{profile.joined}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border border-surface bg-white p-5">
        <h3 className="text-xl font-bold">Tech stack</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.stack.map((tag) => (
            <span key={tag} className="rounded-full bg-surface px-3 py-1 text-sm font-semibold">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="border border-surface bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Auto-built skills graph</h3>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-verified" />
            Visible to recruiters
          </label>
        </div>
        <div className="mt-6 space-y-4">
          {profile.skills.map(([skill, value]) => (
            <div key={skill as string}>
              <div className="flex justify-between text-sm">
                <span className="font-bold">{skill as string}</span>
                <span className="text-muted">{value as number}% depth signal</span>
              </div>
              <div className="mt-2 h-2 bg-surface">
                <span className="block h-full bg-verified" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-surface bg-white p-5">
        <h3 className="text-xl font-bold">Meridian contributions</h3>
        <p className="mt-1 text-sm text-neutral-500">Patches, answers, citations, and published writing over the last year.</p>
        <div className="mt-5">
          <ContributionGrid />
        </div>
      </section>

      <section className="border border-surface bg-white p-5">
        <h3 className="text-xl font-bold">Contribution history</h3>
        <div className="mt-4 space-y-4">
          {[
            ['Accepted patch to OpenTelemetry sampling guide', 'Mar 18, 2026'],
            ['Published Kubernetes CRD migration notes', 'May 02, 2026'],
            ['Mentored draft on Python async queues', 'Jun 11, 2026'],
          ].map(([item, date]) => (
            <div key={item} className="border-l-2 border-verified pl-4">
              <p className="font-semibold">{item}</p>
              <p className="text-sm text-muted">{date}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProfileSidebar() {
  const items = ['Profile', 'Security', 'Settings'];
  return (
    <aside className="h-max border border-surface bg-white p-4">
      {items.map((item, index) => (
        <button
          key={item}
          className={`block h-11 w-full rounded-md px-3 text-left font-semibold ${
            index === 0 ? 'bg-black text-white' : 'text-neutral-600 hover:bg-surface'
          }`}
        >
          {item}
        </button>
      ))}
    </aside>
  );
}

export function ProfilePage() {
  return <ProfileContent />;
}

export function ProfileShell() {
  return (
    <div className="min-h-screen bg-[#f7f8f8] text-ink">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <ProfileSidebar />
        <ProfileContent />
      </div>
    </div>
  );
}
