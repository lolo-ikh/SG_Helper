import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    if (onDone) {
      const timer = setTimeout(onDone, 4000);
      return () => clearTimeout(timer);
    }
  }, [onDone]);

  if (!message) return null;

  return (
    <div className={`toast-notification ${type}`}>
      {message}
    </div>
  );
}
