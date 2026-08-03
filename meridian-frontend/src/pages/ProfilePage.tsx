import { useParams } from 'react-router-dom';
import { Github, Globe, Linkedin, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ContributionGraph } from '../components/ContributionGraph';
import { useUiStore } from '../store/uiStore';
import { api } from '../services/api';
import { toProfile } from '../services/adapters';

function ProfileContent({ username }: { username: string }) {
  const { data: profile } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.getProfile(username).then(toProfile),
    enabled: !!username,
  });
  if (!profile) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#2f3336] bg-[#151515] p-5">
        <div className="flex flex-col gap-6 sm:flex-row">
          <img
            src={profile.avatar}
            alt=""
            className="h-24 w-24 rounded-full object-cover grayscale"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black">{profile.name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold" style={{ background: 'rgba(45,212,163,0.14)', color: '#2DD4A3' }}>
                <ShieldCheck size={16} />
                {profile.credibility}% credible
              </span>
            </div>
            <p className="mt-1" style={{ color: '#71767b' }}>
              {profile.handle} · {profile.designation}
            </p>
            <p className="mt-4 max-w-2xl leading-7">{profile.bio}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3" style={{ color: '#71767b' }}>
              <Github size={19} />
              <Linkedin size={19} />
              <Globe size={19} />
              <span>{profile.joined}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#2f3336] bg-[#151515] p-5">
        <h3 className="text-xl font-bold">Tech stack</h3>
        <p className="mt-1 text-xs" style={{ color: '#536471' }}>Proficiency derived from post depth signals.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.stack.map((tag) => {
            const skillEntry = profile.skills.find(([s]) => s === tag);
            const depth = skillEntry ? (skillEntry[1] as number) : null;
            const level =
              depth === null ? null
              : depth >= 80 ? { label: 'Expert', color: '#2DD4A3' }
              : depth >= 55 ? { label: 'Proficient', color: '#71c7b0' }
              : depth >= 30 ? { label: 'Familiar', color: '#71767b' }
              : { label: 'Learning', color: '#536471' };
            return (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
                style={{ background: 'rgba(45,212,163,0.10)', color: '#2DD4A3', border: '1px solid rgba(45,212,163,0.2)' }}
                title={depth !== null ? `${depth}% depth signal` : undefined}
              >
                {tag}
                {level && (
                  <span
                    className="rounded-full px-1.5 py-0 text-[10px] font-bold"
                    style={{ background: 'rgba(0,0,0,0.3)', color: level.color }}
                  >
                    {level.label}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-[#2f3336] bg-[#151515] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Auto-built skills graph</h3>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#2DD4A3]" />
            Visible to recruiters
          </label>
        </div>
        <p className="mt-1 text-xs" style={{ color: '#536471' }}>When off, recruiters see your tech stack but not detailed skill percentages.</p>
        <div className="mt-6 space-y-4">
          {profile.skills.map(([skill, value]) => (
            <div key={skill as string}>
              <div className="flex justify-between text-sm">
                <span className="font-bold">{skill as string}</span>
                <span style={{ color: '#536471' }}>{value as number}% depth signal</span>
              </div>
              <div className="mt-2 h-2 rounded-full" style={{ background: '#1a1d24' }}>
                <span className="block h-full rounded-full" style={{ width: `${value}%`, background: '#2DD4A3' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#2f3336] bg-[#151515] p-5">
        <h3 className="text-xl font-bold">Meridian contributions</h3>
        <p className="mt-1 text-sm" style={{ color: '#71767b' }}>Patches, answers, citations, and published writing over the last year.</p>
        <div className="mt-5">
          <ContributionGraph variant="full" />
        </div>
      </section>

      <section className="rounded-xl border border-[#2f3336] bg-[#151515] p-5">
        <h3 className="text-xl font-bold">Contribution history</h3>
        <div className="mt-4 space-y-4">
          {[
            ['Accepted patch to OpenTelemetry sampling guide', 'Mar 18, 2026'],
            ['Published Kubernetes CRD migration notes', 'May 02, 2026'],
            ['Mentored draft on Python async queues', 'Jun 11, 2026'],
          ].map(([item, date]) => (
            <div key={item} className="border-l-2 border-[#2DD4A3] pl-4">
              <p className="font-semibold">{item}</p>
              <p className="text-sm" style={{ color: '#536471' }}>{date}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ProfilePage() {
  const me = useUiStore((s) => s.me);
  return <ProfileContent username={me?.username ?? 'alex'} />;
}

export function ProfileShell() {
  const { username } = useParams<{ username: string }>();
  const me = useUiStore((s) => s.me);
  return (
    <div className="min-h-screen text-[#EAECEC]" style={{ background: '#0a0a0a' }}>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <ProfileContent username={username ?? me?.username ?? 'alex'} />
      </div>
    </div>
  );
}
