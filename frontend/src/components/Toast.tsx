'use client';

import React, { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const colors: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', color: '#4ade80', icon: 'rgba(34,197,94,0.15)' },
  error:   { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', color: '#f87171', icon: 'rgba(239,68,68,0.15)' },
  info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', color: '#60a5fa', icon: 'rgba(59,130,246,0.15)' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24', icon: 'rgba(245,158,11,0.15)' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const c = colors[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 280);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 280);
  };

  return (
    <div
      className={exiting ? 'exit' : ''}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        background: 'var(--bg-elevated)',
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-xl)',
        minWidth: '300px',
        maxWidth: '420px',
        animation: exiting ? 'toastOut 0.28s ease-in forwards' : 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Coloured left stripe */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: '3px',
        background: c.color,
        borderRadius: '3px 0 0 3px',
      }} />

      {/* Icon */}
      <div style={{
        width: '28px', height: '28px',
        borderRadius: 'var(--r-sm)',
        background: c.icon,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 700,
        color: c.color,
        flexShrink: 0,
      }}>
        {icons[toast.type]}
      </div>

      <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: '4px' }}>
        {toast.message}
      </span>

      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1,
          padding: '2px', flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
