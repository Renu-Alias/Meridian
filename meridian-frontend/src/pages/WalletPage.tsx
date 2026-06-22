import { ArrowUpRight, CreditCard, WalletCards } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchWallet } from '../services/mockApi';
import { currency } from '../utils/format';

export function WalletPage() {
  const { data } = useQuery({ queryKey: ['wallet'], queryFn: fetchWallet });
  if (!data) return <div className="p-8">Loading wallet...</div>;
  const max = Math.max(...data.trend);
  const stats: Array<[string, number, LucideIcon]> = [
    ['Current Balance', data.balance, WalletCards],
    ['Pending This Cycle', data.pending, ArrowUpRight],
    ['Lifetime Paid', data.paid, CreditCard],
  ];

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(([label, value, Icon]) => (
          <section key={label} className="border border-[#333] bg-[#14171C] p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">{label}</p>
              <Icon size={20} className="text-emerald-700" />
            </div>
            <p className="mt-5 text-3xl font-black">{currency(value)}</p>
          </section>
        ))}
      </div>

      <section className="mt-6 border border-[#333] bg-[#14171C] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Monthly impact analytics</h2>
            <p className="mt-1 text-sm text-neutral-500">Earnings from bookmarks, internal shares, and Used This At Work reactions.</p>
          </div>
          <button className="hidden h-10 rounded-full px-5 font-bold text-black sm:block" style={{ background: '#00C896' }} onClick={() => alert('Payout request flow coming soon')}>Request payout</button>
        </div>
        <div className="mt-8 flex h-56 items-end gap-2 border-b border-l border-[#333] px-3">
          {data.trend.map((point, index) => (
            <div key={index} className="flex flex-1 items-end">
              <span
                className="w-full rounded-t-sm bg-verified"
                style={{ height: `${Math.max(14, (point / max) * 100)}%` }}
                title={currency(point)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 overflow-hidden border border-[#333] bg-[#14171C]">
        <div className="border-b border-[#333] p-5">
          <h2 className="text-2xl font-bold">Earnings by post</h2>
        </div>
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#1a1d24] font-mono text-xs uppercase tracking-[0.18em] text-[#EAECEC]">
              <tr>
                <th className="p-4">Post</th>
                <th className="p-4">Earnings</th>
                <th className="p-4">Bookmarks</th>
                <th className="p-4">Shares</th>
                <th className="p-4">Used at work</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdown.map(([title, earnings, bookmarks, shares, used]) => (
                <tr key={title as string} className="border-t border-[#333]">
                  <td className="p-4 font-bold">{title as string}</td>
                  <td className="p-4">{currency(earnings as number)}</td>
                  <td className="p-4">{bookmarks as number}</td>
                  <td className="p-4">{shares as number}</td>
                  <td className="p-4">{used as number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
