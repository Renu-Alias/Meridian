import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { BrandMark } from '../components/Logo';
import { useUiStore } from '../store/uiStore';
import { api, ApiError } from '../services/api';

const colors = {
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  border: '#2f3336',
  card: '#151515',
  verified: '#2DD4A3',
};

export function AuthPage() {
  const navigate = useNavigate();
  const showToast = useUiStore((s) => s.showToast);
  const setAuthenticated = useUiStore((s) => s.setAuthenticated);
  const setToken = useUiStore((s) => s.setToken);
  const setMe = useUiStore((s) => s.setMe);
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finalize = async () => {
    try {
      const me = await api.getMe();
      setMe({ username: me.username, display_name: me.display_name, avatar_url: me.avatar_url, email: me.email, bio: me.bio });
    } catch {
      // non-fatal — token still valid
    }
    navigate('/feed');
  };

  const signIn = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.access_token);
      setAuthenticated(true);
      await finalize();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 400) {
          setError('Incorrect email or password. Please try again.');
        } else if (err.status === 422) {
          setError('Invalid email or password format.');
        } else {
          setError(err.message || 'Login failed. Please try again.');
        }
      } else {
        showToast('Unexpected error. Please try again.', 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (tab === 'signin') {
      await signIn();
    } else {
      if (!email.trim()) { setError('Please enter your email address.'); return; }
      if (!password) { setError('Please enter a password.'); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      setLoading(true);
      try {
        const username = (name || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const res = await api.register(email, username, name || username, password);
        setToken(res.access_token);
        setAuthenticated(true);
        await finalize();
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 400 || err.status === 409) {
            setError('An account with this email already exists.');
          } else if (err.status === 422) {
            setError('Please check your details — some fields are invalid.');
          } else {
            setError(err.message || 'Registration failed. Please try again.');
          }
        } else {
          showToast('Unexpected error. Please try again.', 'info');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleTab = () => {
    setTab(tab === 'signin' ? 'signup' : 'signin');
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: '#0a0a0a' }}>
      {/* Dot-grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(45,212,163,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + back */}
        <div className="mb-8 flex items-center justify-between">
          <BrandMark to="/" nameClassName="text-lg font-semibold text-[#e7e9ea]" />
          <button
            className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-[#1a1d24]"
            style={{ color: colors.secondary }}
            onClick={() => navigate('/')}
          >
            Back
          </button>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-8 shadow-2xl"
          style={{ background: colors.card, borderColor: colors.border }}
        >
          {/* Tabs */}
          <div className="mb-8 grid grid-cols-2 gap-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <button
              className="pb-3 text-sm font-bold transition-colors"
              style={{
                color: tab === 'signin' ? colors.primary : colors.muted,
                borderBottom: tab === 'signin' ? `2px solid ${colors.verified}` : '2px solid transparent',
              }}
              onClick={() => { setTab('signin'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className="pb-3 text-sm font-bold transition-colors"
              style={{
                color: tab === 'signup' ? colors.primary : colors.muted,
                borderBottom: tab === 'signup' ? `2px solid ${colors.verified}` : '2px solid transparent',
              }}
              onClick={() => { setTab('signup'); setForgotMode(false); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          {forgotMode ? (
            /* Forgot Password */
            <div>
              <h3 className="text-lg font-bold" style={{ color: colors.primary }}>Reset password</h3>
              <p className="mt-1 text-sm" style={{ color: colors.secondary }}>Enter your email and we'll send you a reset link.</p>
              <div className="mt-5">
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.secondary }}>
                  Email address
                </label>
                <input
                  type="email"
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none transition-colors focus:border-[#2DD4A3]"
                  style={{ background: '#0a0a0a', borderColor: colors.border, color: colors.primary }}
                  placeholder="alex@meridian.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all hover:brightness-110"
                style={{ background: colors.verified, color: '#000' }}
                onClick={() => { showToast('Reset link sent!', 'success'); setForgotMode(false); }}
              >
                <Mail size={16} />
                Send Reset Link
              </button>
              <button
                type="button"
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors hover:bg-[#1a1d24]"
                style={{ border: `1px solid ${colors.border}`, color: colors.secondary }}
                onClick={() => setForgotMode(false)}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {tab === 'signup' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.secondary }}>
                      Full name
                    </label>
                    <input
                      className="h-11 w-full rounded-xl border px-4 text-sm outline-none transition-colors focus:border-[#2DD4A3]"
                      style={{ background: '#0a0a0a', borderColor: colors.border, color: colors.primary }}
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.secondary }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    className="h-11 w-full rounded-xl border px-4 text-sm outline-none transition-colors focus:border-[#2DD4A3]"
                    style={{ background: '#0a0a0a', borderColor: colors.border, color: colors.primary }}
                    placeholder="alex@meridian.dev"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-semibold" style={{ color: colors.secondary }}>
                    <span>Password</span>
                    {tab === 'signin' && (
                      <button
                        type="button"
                        className="transition-colors hover:text-[#2DD4A3]"
                        style={{ color: colors.muted }}
                        onClick={() => setForgotMode(true)}
                      >
                        Forgot?
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="h-11 w-full rounded-xl border px-4 pr-10 text-sm outline-none transition-colors focus:border-[#2DD4A3]"
                      style={{ background: '#0a0a0a', borderColor: colors.border, color: colors.primary }}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: colors.muted }}
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div
                    className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                    role="alert"
                  >
                    <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: colors.verified, color: '#000' }}
                >
                  <Mail size={16} />
                  {tab === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <span className="flex-1 h-px" style={{ background: colors.border }} />
                <span className="text-xs font-medium" style={{ color: colors.muted }}>or</span>
                <span className="flex-1 h-px" style={{ background: colors.border }} />
              </div>

              {/* Social buttons */}
              <div className="space-y-2.5">
                <button
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-xl text-sm font-semibold transition-colors hover:bg-[#1a1d24]"
                  style={{ border: `1px solid ${colors.border}`, color: colors.primary }}
                  onClick={() => showToast('GitHub OAuth not configured yet', 'info')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {tab === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                </button>
                <button
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-xl text-sm font-semibold transition-colors hover:bg-[#1a1d24]"
                  style={{ border: `1px solid ${colors.border}`, color: colors.primary }}
                  onClick={() => showToast('OAuth not configured yet', 'info')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                  {tab === 'signin' ? 'Sign in with Apple' : 'Sign up with Apple'}
                </button>
              </div>

              {/* Toggle tab */}
              <p className="mt-6 text-center text-xs" style={{ color: colors.muted }}>
                {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button className="font-semibold transition-colors hover:text-[#2DD4A3]" style={{ color: colors.verified }} onClick={toggleTab}>
                  {tab === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs" style={{ color: colors.muted }}>
          By continuing, you agree to Meridian's{' '}
          <button className="underline transition-colors hover:text-[#2DD4A3]">Terms</button>
          {' '}and{' '}
          <button className="underline transition-colors hover:text-[#2DD4A3]">Privacy Policy</button>.
        </p>
      </div>
    </div>
  );
}
