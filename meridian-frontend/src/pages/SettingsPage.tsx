import { Bell, Eye, Key, Shield, User } from 'lucide-react';

const sections = [
  {
    icon: User,
    title: 'Profile',
    fields: [
      ['Display name', 'Alex Rivera'],
      ['Handle', '@arivera.dev'],
      ['Bio', 'Writes about distributed systems, observability...'],
      ['Email', 'alex@meridian.dev'],
    ],
  },
  {
    icon: Eye,
    title: 'Appearance',
    fields: [
      ['Theme', 'Dark'],
      ['Font size', 'Medium'],
      ['Reduce motion', 'Off'],
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    fields: [
      ['Push notifications', 'On'],
      ['Email digest', 'Weekly'],
      ['Mentor requests', 'On'],
    ],
  },
  {
    icon: Key,
    title: 'Account',
    fields: [
      ['Connected wallet', '0x7421...8e3f'],
      ['GitHub integration', 'Connected'],
      ['API keys', 'Manage'],
    ],
  },
];

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <h1 className="mb-8 text-3xl font-black">Settings</h1>
      <div className="space-y-6">
        {sections.map(({ icon: Icon, title, fields }) => (
          <section key={title} className="border border-[#333] bg-black">
            <div className="flex items-center gap-3 border-b border-[#333] px-6 py-4">
              <Icon size={18} className="text-verified" />
              <h2 className="text-lg font-bold">{title}</h2>
            </div>
            <div className="divide-y divide-[#222]">
              {fields.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-sm text-neutral-500">{label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{value}</span>
                    <button className="rounded-md border border-[#333] px-3 py-1 text-xs font-medium transition-colors hover:bg-[#1a1d24]">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
