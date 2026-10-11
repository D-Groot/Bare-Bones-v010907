import { useCallback, useState } from 'react';
import type { ToastMessage } from '../components/Toast';

export type ToastType = ToastMessage['type'];

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    // Keep the stack short so a burst of actions can't cover the screen.
    setToasts((prev) => [...prev.slice(-3), { id, type, message, title }]);
  }, []);

  return { toasts, notify, dismiss };
}
