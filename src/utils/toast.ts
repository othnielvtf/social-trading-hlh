export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export type ToastPayload = {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

const EVENT_NAME = 'app-toast';

export function showToast(payload: ToastPayload) {
  const evt = new CustomEvent(EVENT_NAME, { detail: payload });
  window.dispatchEvent(evt);
}

export function getToastEventName() {
  return EVENT_NAME;
}
