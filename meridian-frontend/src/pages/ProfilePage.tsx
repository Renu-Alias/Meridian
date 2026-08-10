import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Github, Linkedin, ShieldCheck, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ContributionGraph } from '../components/ContributionGraph';
import { useUiStore } from '../store/uiStore';
import { api } from '../services/api';
import { toProfile, toPost } from '../services/adapters';

function ProfileContent({ username }: { username: string }) {
  const me = useUiStore((s) => s.me);
  const showToast = useUiStore((s) => s.showToast);
  const setAvatar = useUiStore((s) => s.setAvatar);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const isMe = !!me && me.username === username;
  const { data: profile } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.getProfile(username).then(toProfile),
    enabled: !!username,
  });
  const { data: posts = [] } = useQuery({
    queryKey: ['profile-posts', username],
    queryFn: () => api.getProfilePosts(username).then((items) => items.map(toPost)),
    enabled: !!username,
  });

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadAvatar(file);
      setAvatar(res.avatar_url);
      await queryClient.invalidateQueries({ queryKey: ['profile', username] });
      showToast('Profile photo updated', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed', 'info');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onRemoveAvatar = async () => {
    try {
      const res = await api.removeAvatar();
      setAvatar(res.avatar_url);
      await queryClient.invalidateQueries({ queryKey: ['profile', username] });
      showToast('Profile photo removed', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove photo', 'info');
    }
  };

  const toggleFollow = async () => {
    if (!me) {
      showToast('Sign in to follow accounts', 'info');
      return;
    }
    if (!profile) return;
    const target = profile.is_following;
    setFollowBusy(true);
    try {
      if (target) {
        await api.unfollowUser(username);
      } else {
        await api.followUser(username);
      }
      await queryClient.invalidateQueries({ queryKey: ['profile', username] });
      showToast(target ? 'Unfollowed' : 'Following', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'info');
    } finally {
      setFollowBusy(false);
    }
  };
  if (!profile) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#2f3336] bg-[#151515] p-5">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="relative shrink-0 self-start">
            <img
              src={profile.avatar}
              alt=""
              className="h-24 w-24 rounded-full object-cover grayscale"
            />
            {isMe && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-[#2f3336] bg-[#1a1d24] text-[#e7e9ea] transition-colors hover:bg-[#2DD4A3] hover:text-black"
                title="Upload photo"
              >
                <Camera size={15} />
              </button>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-black">{profile.name}</h2>
                <span className="inline-flex items-center gap-1 rounded-md px-3 py-1 text-sm font-bold" style={{ background: 'rgba(45,212,163,0.14)', color: '#2DD4A3' }}>
                  <ShieldCheck size={16} />
                  {profile.credibility}% credible
                </span>
              </div>
              {!isMe && (
                <button
                  type="button"
                  onClick={toggleFollow}
                  disabled={followBusy}
                  className="rounded-md px-4 py-1.5 text-sm font-bold transition-colors"
                  style={
                    profile.is_following
                      ? { border: '1px solid #2DD4A3', color: '#2DD4A3' }
                      : { background: '#2DD4A3', color: '#0a0a0a' }
                  }
                >
                  {followBusy ? 'Working…' : profile.is_following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            <p className="mt-1" style={{ color: '#71767b' }}>
              {profile.handle} · {profile.designation}
            </p>
            <p className="mt-4 max-w-2xl leading-7">{profile.bio}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3" style={{ color: '#71767b' }}>
              {profile.github && (
                <a
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noreferrer"
                  title={`github.com/${profile.github}`}
                  className="transition-colors hover:text-[#2DD4A3]"
                >
                  <Github size={19} />
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  title={`linkedin.com/in/${profile.linkedin}`}
                  className="transition-colors hover:text-[#2DD4A3]"
                >
                  <Linkedin size={19} />
                </a>
              )}
              <span>{profile.joined}</span>
              <span className="flex items-center gap-3 text-sm">
                <span>
                  <b style={{ color: '#e7e9ea' }}>{profile.followers_count}</b> followers
                </span>
                <span>
                  <b style={{ color: '#e7e9ea' }}>{profile.following_count}</b> following
                </span>
              </span>
            </div>
          </div>
        </div>
        {isMe && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={onPickFile}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-md border border-[#2f3336] px-3 py-1.5 text-sm font-semibold transition-colors hover:border-[#2DD4A3] hover:text-[#2DD4A3]"
            >
              {uploading ? 'Uploading…' : 'Change photo'}
            </button>
            {me?.avatar_url && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#2f3336] px-3 py-1.5 text-sm font-semibold transition-colors hover:border-red-500/60 hover:text-red-400"
              >
                <Trash2 size={14} />
                Remove photo
              </button>
            )}
            <span className="text-xs" style={{ color: '#536471' }}>JPG, PNG, WebP or GIF · up to 5 MB</span>
          </div>
        )}
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
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-semibold"
                style={{ background: 'rgba(45,212,163,0.10)', color: '#2DD4A3', border: '1px solid rgba(45,212,163,0.2)' }}
                title={depth !== null ? `${depth}% depth signal` : undefined}
              >
                {tag}
                {level && (
                  <span
                    className="rounded-md px-1.5 py-0 text-[10px] font-bold"
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
            <input type="checkbox" defaultChecked className="peer sr-only" />
            <span className="relative h-5 w-9 shrink-0 cursor-pointer rounded-[4px] border border-[#2f3336] bg-[#1a1d24] transition-colors after:absolute after:left-[3px] after:top-[3px] after:h-[12px] after:w-[12px] after:rounded-[2px] after:bg-[#536471] after:transition-all peer-checked:border-[#2DD4A3] peer-checked:bg-[#2DD4A3] peer-checked:after:translate-x-4 peer-checked:after:bg-black" />
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
          <ContributionGraph variant="full" seedKey={username} since={profile.created_at} events={posts.map((p) => ({ date: p.date ?? '' }))} />
        </div>
      </section>

      <section className="rounded-xl border border-[#2f3336] bg-[#151515] p-5">
        <h3 className="text-xl font-bold">{isMe ? 'My posts' : 'Posts'}</h3>
        <p className="mt-1 text-sm" style={{ color: '#71767b' }}>Published writing by {isMe ? 'you' : profile.name}.</p>
        <div className="mt-4 space-y-2">
          {posts.length === 0 && (
            <p className="text-sm" style={{ color: '#536471' }}>No published posts yet.</p>
          )}
          {posts.map((post) => (
            <button
              key={post.id}
              className="block w-full rounded-lg px-4 py-3 text-left transition-colors hover:bg-[#1a1d24]"
              style={{ border: '1px solid #2f3336' }}
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <p className="font-semibold" style={{ color: '#e7e9ea' }}>{post.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: '#536471' }}>
                <span>{post.age}</span>
                <span style={{ color: '#2DD4A3' }}>{post.likes} likes</span>
                <span>{post.comments} comments</span>
                <span>{post.forks} forks</span>
              </div>
            </button>
          ))}
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
