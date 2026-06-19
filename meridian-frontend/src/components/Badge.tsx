import { CheckCircle2, Flag } from 'lucide-react';
import type { Post } from '../services/mockApi';

type BadgeProps = {
  status: Post['status'];
  label?: string;
};

export function Badge({ status, label }: BadgeProps) {
  const isFlagged = status === 'flagged';
  const className = isFlagged
    ? 'bg-flagged/10 text-flagged ring-1 ring-flagged/30'
    : 'bg-verified text-black';
  const Icon = isFlagged ? Flag : CheckCircle2;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      <Icon aria-hidden="true" size={13} />
      {label ?? (isFlagged ? 'Unverified Claim' : 'Verified')}
    </span>
  );
}
