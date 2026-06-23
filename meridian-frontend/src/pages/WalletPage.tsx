import { useState } from 'react';
import { ArrowUpRight, CreditCard, WalletCards, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useUiStore } from '../store/uiStore';
import { fetchWallet } from '../services/mockApi';
import { currency } from '../utils/format';

export function WalletPage() {
  const { data } = useQuery({ queryKey: ['wallet'], queryFn: fetchWallet });
  const showToast = useUiStore((s) => s.showToast);
  const [showPayout, setShowPayout] = useState(false);
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
          <button className="hidden h-10 rounded-full px-5 font-bold text-black sm:block" style={{ background: '#00C896' }} onClick={() => setShowPayout(true)}>Request payout</button>
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
      {showPayout && (
        <>
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setShowPayout(false)} />
          <div className="fixed left-1/2 top-1/3 z-40 w-full max-w-sm -translate-x-1/2 -translate-y-1/3 rounded-xl border p-6 shadow-2xl" style={{ background: '#14171c', borderColor: '#2f3336' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: '#e7e9ea' }}>Request Payout</h3>
              <button onClick={() => setShowPayout(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#1a1d24]" style={{ color: '#71767b' }}><X size={18} /></button>
            </div>
            <p className="mt-3 text-sm" style={{ color: '#71767b' }}>Request a payout of <b style={{ color: '#e7e9ea' }}>{currency(data.balance)}</b> to your connected Stripe account.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowPayout(false)} className="flex-1 h-10 rounded-full text-sm font-bold" style={{ border: '1px solid #2f3336', color: '#71767b' }}>Cancel</button>
              <button onClick={() => { setShowPayout(false); showToast(`Payout of ${currency(data.balance)} requested!`, 'success'); }} className="flex-1 h-10 rounded-full text-sm font-bold text-black" style={{ background: '#00C896' }}>Confirm Payout</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
