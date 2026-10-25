import { Loader2 } from 'lucide-react';

export default function LoadingState({ label }) {
  return (
    <>
      <Loader2 className="spin" size={18} aria-hidden="true" />
      <span>{label}</span>
    </>
  );
}
