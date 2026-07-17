import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '../store/uiStore';

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(clearToast, 3000);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
