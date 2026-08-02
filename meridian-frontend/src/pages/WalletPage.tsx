import { useState } from 'react';
import { ArrowUpRight, CreditCard, WalletCards, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUiStore } from '../store/uiStore';
import { api } from '../services/api';
import { toWallet } from '../services/adapters';
import { currency } from '../utils/format';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function WalletPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['wallet'], queryFn: () => api.getWallet().then(toWallet) });
  const showToast = useUiStore((s) => s.showToast);
  const [showPayout, setShowPayout] = useState(false);
  const [paying, setPaying] = useState(false);
  if (!data) return <div className="p-8">Loading wallet...</div>;
  const max = Math.max(...data.trend);
  const stats: Array<[string, number, LucideIcon]> = [
    ['Current Balance', data.balance, WalletCards],
    ['Pending This Cycle', data.pending, ArrowUpRight],
    ['Lifetime Paid', data.paid, CreditCard],
  ];

  const confirmPayout = async () => {
    setPaying(true);
    try {
      const res = await api.requestPayout(data.balance);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      showToast(`Payout of ${currency(res.amount ?? data.balance)} requested!`, 'success');
    } catch (err) {
      showToast('Payout failed', 'info');
    } finally {
      setPaying(false);
      setShowPayout(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(([label, value, Icon]) => (
          <section key={label} className="rounded-xl border border-[#2f3336] bg-[#151515] p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: '#71767b' }}>{label}</p>
              <Icon size={20} style={{ color: '#2DD4A3' }} />
            </div>
            <p className="mt-5 text-3xl font-black">{currency(value)}</p>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-[#2f3336] bg-[#151515] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Monthly impact analytics</h2>
            <p className="mt-1 text-sm" style={{ color: '#71767b' }}>Earnings from bookmarks, internal shares, and Used This At Work reactions.</p>
          </div>
          <button className="hidden h-10 rounded-full px-5 font-bold text-black sm:block" style={{ background: '#2DD4A3' }} onClick={() => setShowPayout(true)}>Request payout</button>
        </div>
        <div className="mt-8 flex items-end gap-0 rounded-lg border border-[#2f3336] bg-[#0a0a0a] p-4" style={{ height: 260 }}>
          <div className="flex flex-1 items-end gap-1.5">
            {data.trend.map((point, index) => {
              const pct = max > 0 ? (point / max) * 100 : 0;
              return (
                <div key={index} className="group relative flex flex-1 flex-col items-center gap-1">
                  <span className="absolute bottom-full mb-1 hidden rounded bg-[#1a1d24] px-2 py-0.5 text-[11px] shadow-lg group-hover:block" style={{ color: '#e7e9ea', border: '1px solid #2f3336' }}>
                    {currency(point)}
                  </span>
                  <span
                    className="w-full rounded-t transition-all group-hover:brightness-125"
                    style={{
                      height: `${Math.max(8, pct)}%`,
                      background: `linear-gradient(to top, rgba(45,212,163,0.25), rgba(45,212,163,0.7))`,
                    }}
                  />
                  <span className="text-[10px]" style={{ color: '#536471' }}>{months[index]?.slice(0, 1) ?? ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-[#2f3336] bg-[#151515]">
        <div className="border-b border-[#2f3336] p-5">
          <h2 className="text-2xl font-bold">Earnings by post</h2>
        </div>
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ background: '#1a1d24', borderBottom: '2px solid #2f3336' }}>
              <tr>
                <th className="px-4 py-3 font-semibold" style={{ color: '#e7e9ea' }}>Post</th>
                <th className="px-4 py-3 font-semibold" style={{ color: '#e7e9ea' }}>Earnings</th>
                <th className="px-4 py-3 font-semibold" style={{ color: '#e7e9ea' }}>Bookmarks</th>
                <th className="px-4 py-3 font-semibold" style={{ color: '#e7e9ea' }}>Shares</th>
                <th className="px-4 py-3 font-semibold" style={{ color: '#e7e9ea' }}>Used at work</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdown.map(([title, earnings, bookmarks, shares, used]) => (
                <tr key={title as string} className="border-t border-[#2f3336]/50 transition-colors hover:bg-[#1a1d24]">
                  <td className="px-4 py-3.5 font-bold">{title as string}</td>
                  <td className="px-4 py-3.5" style={{ color: '#2DD4A3' }}>{currency(earnings as number)}</td>
                  <td className="px-4 py-3.5">{bookmarks as number}</td>
                  <td className="px-4 py-3.5">{shares as number}</td>
                  <td className="px-4 py-3.5">{used as number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {showPayout && (
        <>
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setShowPayout(false)} />
          <div className="fixed left-1/2 top-1/3 z-40 w-full max-w-sm -translate-x-1/2 -translate-y-1/3 rounded-xl border p-6 shadow-2xl" style={{ background: '#151515', borderColor: '#2f3336' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: '#e7e9ea' }}>Request Payout</h3>
              <button onClick={() => setShowPayout(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#1a1d24]" style={{ color: '#71767b' }}><X size={18} /></button>
            </div>
            <p className="mt-3 text-sm" style={{ color: '#71767b' }}>Request a payout of <b style={{ color: '#e7e9ea' }}>{currency(data.balance)}</b> to your connected wallet.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowPayout(false)} className="flex-1 h-10 rounded-full text-sm font-bold" style={{ border: '1px solid #2f3336', color: '#71767b' }}>Cancel</button>
              <button onClick={confirmPayout} disabled={paying} className="flex-1 h-10 rounded-full text-sm font-bold text-black disabled:opacity-50" style={{ background: '#2DD4A3' }}>{paying ? 'Processing...' : 'Confirm Payout'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
