import { CheckCircle2, AlertCircle } from 'lucide-react';

/** Accessible success / error banner. Errors are announced immediately, success politely. */
export default function StatusMessage({ type, children }) {
  if (!children) return null;
  const isError = type === 'error';
  return (
    <div className={`status status--${isError ? 'error' : 'success'}`} role={isError ? 'alert' : 'status'}>
      {isError ? <AlertCircle size={20} aria-hidden="true" /> : <CheckCircle2 size={20} aria-hidden="true" />}
      <p>{children}</p>
    </div>
  );
}
