import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useUiStore } from '../store/uiStore';

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(clearToast, 3000);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2">
      <div
        className="flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium shadow-xl"
        style={{
          background: toast.type === 'success' ? '#00C896' : '#14171C',
          color: toast.type === 'success' ? '#000' : '#e7e9ea',
          border: '1px solid #2f3336',
        }}
      >
        {toast.message}
        <button onClick={clearToast} className="ml-1 hover:opacity-70" aria-label="Dismiss">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
