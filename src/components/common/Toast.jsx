import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export const Toast = () => {
  const { toast, hideToast } = useTasks();

  if (!toast) return null;

  const { message, type, undoAction } = toast;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />,
  };

  const bgStyles = {
    success: 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100 dark:bg-emerald-950/90',
    error: 'border-rose-500/30 bg-rose-950/90 text-rose-100 dark:bg-rose-950/90',
    info: 'border-sky-500/30 bg-sky-950/90 text-sky-100 dark:bg-sky-950/90',
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-fade-in max-w-sm w-full">
      <div
        className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-md shadow-2xl ${
          bgStyles[type] || bgStyles.info
        }`}
      >
        <div className="flex items-center gap-3 pr-2">
          {icons[type]}
          <p className="text-sm font-medium">{message}</p>
        </div>

        <div className="flex items-center gap-2">
          {undoAction && (
            <button
              onClick={() => {
                undoAction();
                hideToast();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>
          )}
          <button
            onClick={hideToast}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
