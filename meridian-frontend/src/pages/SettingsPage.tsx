import { useState } from 'react';
import { Bell, Eye, Key, LogOut, Shield, ShieldAlert, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUiStore, type Me } from '../store/uiStore';

const initialSections = [
  {
    icon: Eye,
    title: 'Appearance',
    fields: [
      { label: 'Theme', value: 'Dark', editable: true },
      { label: 'Font size', value: 'Medium', editable: true },
      { label: 'Reduce motion', value: 'Off', editable: true },
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    fields: [
      { label: 'Push notifications', value: 'On', editable: true },
      { label: 'Email digest', value: 'Weekly', editable: true },
      { label: 'Mentor requests', value: 'On', editable: true },
    ],
  },
  {
    icon: Key,
    title: 'Account',
    fields: [
      { label: 'Connected wallet', value: '0x7421...8e3f', editable: false },
      { label: 'GitHub integration', value: 'Connected', editable: false },
      { label: 'API keys', value: 'Edit', editable: false },
    ],
  },
];

const profileFields = (me: Me | null) => [
  { label: 'Display name', value: me?.display_name || '—', editable: true },
  { label: 'Handle', value: me?.username ? `@${me.username}` : '—', editable: true },
  { label: 'Bio', value: me?.bio || '', editable: true },
  { label: 'Email', value: me?.email || '—', editable: true },
];

export function SettingsPage() {
  const showToast = useUiStore((s) => s.showToast);
  const me = useUiStore((s) => s.me);
  const logout = useUiStore((s) => s.logout);
  const navigate = useNavigate();
  const [sections, setSections] = useState(() => [
    { icon: User, title: 'Profile', fields: profileFields(me) },
    ...initialSections,
  ]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showDangerConfirm, setShowDangerConfirm] = useState<'deactivate' | 'delete' | null>(null);

  const startEdit = (fieldKey: string, currentValue: string) => {
    setEditingField(fieldKey);
    setEditValue(currentValue);
  };

  const saveEdit = (fieldKey: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        fields: sec.fields.map((f) =>
          f.label === fieldKey ? { ...f, value: editValue } : f
        ),
      }))
    );
    setEditingField(null);
    showToast('Saved', 'success');
  };

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <h1 className="mb-8 text-3xl font-black">Settings</h1>
      <div className="space-y-6">
        {sections.map(({ icon: Icon, title, fields }) => (
          <section key={title} className="rounded-xl border border-[#2f3336] bg-[#151515]">
            <div className="flex items-center gap-3 border-b border-[#2f3336] px-6 py-4">
              <Icon size={18} style={{ color: '#2DD4A3' }} />
              <h2 className="text-lg font-bold">{title}</h2>
            </div>
            <div className="divide-y divide-[#2f3336]/40">
              {fields.map((field) => {
                const fieldKey = field.label;
                const isEditing = editingField === fieldKey;
                return (
                  <div key={fieldKey} className="flex items-center justify-between px-6 py-3.5">
                    <span className="text-sm" style={{ color: '#71767b' }}>{field.label}</span>
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <input
                          autoFocus
                          className="w-48 rounded-md border border-[#2f3336] bg-[#0a0a0a] px-3 py-1 text-sm font-medium outline-none focus:border-[#2DD4A3]"
                          style={{ color: '#e7e9ea' }}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(fieldKey); if (e.key === 'Escape') setEditingField(null); }}
                          onBlur={() => saveEdit(fieldKey)}
                        />
                      ) : (
                        <span className="text-sm font-medium">{field.value}</span>
                      )}
                      {field.editable && (
                        <button
                          className="rounded-md border border-[#2f3336] px-3 py-1 text-xs font-medium transition-colors hover:bg-[#1a1d24]"
                          onClick={() => isEditing ? saveEdit(fieldKey) : startEdit(fieldKey, field.value)}
                        >
                          {isEditing ? 'Done' : 'Edit'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Log out */}
      <section className="mt-6 rounded-xl border border-[#2f3336] bg-[#151515] p-6">
        <button
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-all hover:brightness-110"
          style={{ background: '#2DD4A3', color: '#0a0a0a' }}
          onClick={() => { logout(); showToast('Logged out', 'success'); navigate('/'); }}
        >
          <LogOut size={16} /> Log out
        </button>
      </section>

      {/* Danger Zone */}
      <section className="mt-6 rounded-xl border border-red-500/30 bg-[#151515]">
        <div className="flex items-center gap-3 border-b border-red-500/30 px-6 py-4">
          <ShieldAlert size={18} style={{ color: '#FF6B6B' }} />
          <h2 className="text-lg font-bold" style={{ color: '#FF6B6B' }}>Danger Zone</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Deactivate account</p>
              <p className="text-sm" style={{ color: '#536471' }}>Temporarily disable your account. You can reactivate anytime.</p>
            </div>
            <button
              className="rounded-md border border-red-500/40 px-4 py-2 text-sm font-bold transition-colors hover:bg-red-500/10"
              style={{ color: '#FF6B6B' }}
              onClick={() => showToast('Account deactivated', 'info')}
            >
              Deactivate
            </button>
          </div>
          <div className="border-t border-red-500/20 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Delete account</p>
                <p className="text-sm" style={{ color: '#536471' }}>Permanently delete your account and all associated data. This cannot be undone.</p>
              </div>
              <button
                className="rounded-md px-4 py-2 text-sm font-bold transition-colors"
                style={showDangerConfirm === 'delete' ? { background: '#FF6B6B', color: '#000' } : { background: 'rgba(255,107,107,0.1)', color: '#FF6B6B' }}
                onClick={() => {
                  if (showDangerConfirm === 'delete') {
                    showToast('Account deleted', 'info');
                    setShowDangerConfirm(null);
                    navigate('/');
                  } else {
                    setShowDangerConfirm('delete');
                    showToast('Click again to confirm deletion', 'info');
                  }
                }}
              >
                {showDangerConfirm === 'delete' ? 'Confirm delete' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
