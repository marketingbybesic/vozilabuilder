import { useEffect, useState } from 'react';
import { Bell, BellOff, TrendingDown, TrendingUp } from 'lucide-react';
import { isWatching, watchPrice, unwatchPrice, priceDelta } from '../../lib/priceWatch';

interface Props {
  listingId: string;
  currentPrice: number;
  currency?: string;
}

// "Pratite cijenu" toggle on VDP. When active and price drops since snapshot,
// shows a green inline indicator. Loss-aversion driver — once you watch, you
// emotionally commit; we surface the savings to make the urgency real.
export const PriceWatchButton = ({ listingId, currentPrice, currency = 'EUR' }: Props) => {
  const [watching, setWatching] = useState(false);
  const [delta, setDelta] = useState<{ delta: number; pct: number } | null>(null);

  useEffect(() => {
    setWatching(isWatching(listingId));
    setDelta(priceDelta(listingId, currentPrice));
    const onUpd = () => {
      setWatching(isWatching(listingId));
      setDelta(priceDelta(listingId, currentPrice));
    };
    window.addEventListener('vozila:price-watch-updated', onUpd);
    return () => window.removeEventListener('vozila:price-watch-updated', onUpd);
  }, [listingId, currentPrice]);

  const onToggle = () => {
    if (watching) unwatchPrice(listingId);
    else          watchPrice(listingId, currentPrice, currency);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={onToggle}
        className={`inline-flex items-center gap-2 px-3 py-2 text-[10px] font-light uppercase tracking-[0.25em] border transition-colors ${
          watching
            ? 'border-primary text-primary bg-primary/10'
            : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
        }`}
      >
        {watching ? <Bell className="w-3.5 h-3.5" strokeWidth={1.5} /> : <BellOff className="w-3.5 h-3.5" strokeWidth={1.5} />}
        {watching ? 'Pratite cijenu' : 'Prati cijenu'}
      </button>

      {/* Drop / rise indicator (only shown when there's a delta and >1% change) */}
      {watching && delta && Math.abs(delta.pct) > 1 && (
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.2em] tabular-nums ${
            delta.delta < 0 ? 'text-emerald-500' : 'text-amber-500'
          }`}
        >
          {delta.delta < 0 ? <TrendingDown className="w-3 h-3" strokeWidth={1.5} /> : <TrendingUp className="w-3 h-3" strokeWidth={1.5} />}
          {delta.delta < 0 ? '−' : '+'}
          {Math.abs(Math.round(delta.delta)).toLocaleString('hr-HR')} {currency === 'EUR' ? '€' : currency}
          <span className="opacity-60">({delta.pct >= 0 ? '+' : ''}{delta.pct.toFixed(1)}%)</span>
        </span>
      )}
    </div>
  );
};
