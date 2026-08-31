import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const SuccessToast: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 pointer-events-none flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map(toast => {
          const icon = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
            error: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
            warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
            info: <Info className="h-5 w-5 text-sky-600 shrink-0" />,
          }[toast.type];

          const borderBg = {
            success: 'bg-white/95 border-emerald-300 shadow-xl shadow-emerald-950/5',
            error: 'bg-white/95 border-rose-300 shadow-xl shadow-rose-950/5',
            warning: 'bg-white/95 border-amber-300 shadow-xl shadow-amber-950/5',
            info: 'bg-white/95 border-sky-300 shadow-xl shadow-sky-950/5',
          }[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md ${borderBg}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{toast.title}</p>
                {toast.message && (
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
