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
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${className}`}>
      <Icon aria-hidden="true" size={12} />
      {label ?? (isFlagged ? 'Unverified Claim' : 'Verified')}
    </span>
  );
}
