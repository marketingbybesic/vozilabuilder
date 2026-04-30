import { useState } from 'react';
import { Share2, MessageCircle, Link2, Check } from 'lucide-react';

interface Props {
  title: string;
  url?: string;
}

// Native Web Share API where available; fallback to a row of channel buttons
// (WhatsApp, Facebook, X, copy link). Theme-aware. Used on the listing detail.
export const ShareButtons = ({ title, url }: Props) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${title} — Vozila.hr`;

  const useNative = typeof navigator !== 'undefined' && (navigator as any).share;

  const onNative = async () => {
    try {
      await (navigator as any).share({ title: shareText, url: shareUrl });
    } catch { /* user cancelled */ }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const wa = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="border border-border bg-muted/20 p-4 sm:p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h4 className="text-[10px] font-light uppercase tracking-[0.3em] text-foreground inline-flex items-center gap-2">
          <Share2 className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
          Podijeli oglas
        </h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {useNative && (
          <button
            onClick={onNative}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border text-foreground text-[10px] font-light uppercase tracking-[0.25em] hover:border-primary hover:text-primary transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            Podijeli
          </button>
        )}
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 border border-border text-foreground text-[10px] font-light uppercase tracking-[0.25em] hover:border-[#25D366] hover:text-[#25D366] transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
          WhatsApp
        </a>
        <a
          href={fb}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 border border-border text-foreground text-[10px] font-light uppercase tracking-[0.25em] hover:border-primary hover:text-primary transition-colors"
        >
          Facebook
        </a>
        <a
          href={tw}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 border border-border text-foreground text-[10px] font-light uppercase tracking-[0.25em] hover:border-primary hover:text-primary transition-colors"
        >
          X / Twitter
        </a>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-2 px-3 py-2 border border-border text-foreground text-[10px] font-light uppercase tracking-[0.25em] hover:border-primary hover:text-primary transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2} /> : <Link2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
          {copied ? 'Kopirano' : 'Kopiraj link'}
        </button>
      </div>
    </div>
  );
};
