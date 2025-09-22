import React, { useEffect, useState } from 'react';
import { getToastEventName, ToastPayload } from '../utils/toast';

interface ToastItem extends Required<Pick<ToastPayload, 'id' | 'title' | 'description' | 'variant' | 'durationMs'>> {}

const defaultDuration = 3500;

const variantClasses: Record<string, string> = {
  default: 'bg-card text-foreground border-border',
  success: 'bg-green-600 text-white border-green-700',
  error: 'bg-red-600 text-white border-red-700',
  warning: 'bg-yellow-500 text-black border-yellow-600',
};

export const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<ToastPayload>;
      const payload = custom.detail || {};
      const id = payload.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const item: ToastItem = {
        id,
        title: payload.title || '',
        description: payload.description || '',
        variant: payload.variant || 'default',
        durationMs: payload.durationMs || defaultDuration,
      };
      setToasts(prev => [...prev, item]);
      window.setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, item.durationMs);
    };

    window.addEventListener(getToastEventName(), handler as EventListener);
    return () => window.removeEventListener(getToastEventName(), handler as EventListener);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`border rounded-md shadow-md p-3 w-80 ${variantClasses[t.variant] || variantClasses.default}`}>
          {t.title && <div className="font-medium text-sm mb-1">{t.title}</div>}
          {t.description && <div className="text-sm opacity-90">{t.description}</div>}
        </div>
      ))}
    </div>
  );
};
