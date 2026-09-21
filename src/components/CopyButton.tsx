import { useState } from 'react';

export function CopyButton({ text, onCopy }: { text: string, onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 1200);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn btn-ghost btn-xs px-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Copy to clipboard"
    >
      {copied
        ? <img src="/images/icons/clipboard-tick.svg" alt="Copied" className="h-4 w-4" />
        : <img src="/images/icons/clipboard.svg" alt="Copy" className="h-4 w-4" />
      }
    </button>
  );
}
