import { CheckCircle2, Flag } from 'lucide-react';
import type { Post } from '../services/mockApi';

type BadgeProps = {
  status: Post['status'];
  label?: string;
};

export function Badge({ status, label }: BadgeProps) {
  const isFlagged = status === 'flagged';
  const text = label ?? (isFlagged ? 'Unverified Claim' : 'Verified');
  const color = isFlagged ? '#FF6B6B' : '#2DD4A3';

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4"
      style={{
        background: isFlagged ? 'rgba(255,107,107,0.1)' : 'rgba(45,212,163,0.12)',
        color,
      }}
    >
      {isFlagged ? <Flag size={11} /> : <CheckCircle2 size={11} />}
      {text}
    </span>
  );
}
