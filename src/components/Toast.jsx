import { useEffect, useState } from 'react';
import { IconCheck, IconX } from './Icons';

const VISIBLE_MS = 3200;

/**
 * Transient confirmation that a food landed in the log. Keyed by the caller so
 * logging twice in a row replays the animation instead of sitting still.
 */
export default function Toast({ toast, onDismiss }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;

    const hide = setTimeout(() => setLeaving(true), VISIBLE_MS);
    const remove = setTimeout(onDismiss, VISIBLE_MS + 260);

    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [toast, onDismiss]);

  // A fresh toast has to clear the leaving flag, which cannot happen in the
  // effect above without fighting the timers, so reset it on identity change.
  useEffect(() => {
    const id = requestAnimationFrame(() => setLeaving(false));
    return () => cancelAnimationFrame(id);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="toast-layer" aria-live="polite">
      <div className={`toast${leaving ? ' toast--leaving' : ''}`}>
        <span className="toast__icon">
          <IconCheck size={17} />
        </span>
        <span className="toast__text">
          <strong className="toast__title">{toast.title}</strong>
          <span className="toast__detail">{toast.detail}</span>
        </span>
        <button
          type="button"
          className="toast__close"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <IconX size={15} />
        </button>
      </div>
    </div>
  );
}
