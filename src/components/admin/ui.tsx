"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

/** A labelled form field for the light dashboard theme. */
export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="dash-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-[#a08a66]">{hint}</span>}
    </label>
  );
}

/** A soft success toast that auto-dismisses. Lives bottom-center. */
export function Toast({
  message,
  onDone,
}: {
  message: string | null;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [message, onDone]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-[200] -translate-x-1/2"
        >
          <div className="flex items-center gap-2.5 rounded-full bg-[#3a2c1c] px-6 py-3 text-[15px] font-semibold text-[#f6ecd8] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.5)]">
            <span className="text-lg text-[#f5b860]">✓</span>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A confirm dialog with a warm, non-technical tone. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "削除する",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[210] flex items-center justify-center bg-[#2a1c12]/40 px-6 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-[#e6dcc6] bg-[#fbf6ec] p-7 shadow-2xl"
          >
            <h3 className="font-display text-xl font-bold text-[#3a2c1c]">{title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#6a523a]">{body}</p>
            <div className="mt-7 flex gap-3">
              <button onClick={onCancel} className="dash-btn-ghost flex-1">
                やめる
              </button>
              <button
                onClick={onConfirm}
                className="dash-btn-danger flex-1 !bg-[#a14b32] !text-white"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Friendly empty-state block. */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="dash-card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="font-display text-lg font-bold text-[#3a2c1c]">{title}</h3>
      <p className="max-w-xs text-[14px] leading-relaxed text-[#8a7458]">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
