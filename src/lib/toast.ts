/**
 * Custom event-based toast helper for RTIH InnovationOS.
 * Replaces the blocking alert() popup with a non-blocking toast.
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('rtih_toast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }
}
