import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Check } from 'lucide-react';
import { isInCompare, toggleCompare, getCompareIds } from '../../lib/compareList';

interface Props { listingId: string }

// "Dodaj u usporedbu" — single button on VDP. Toggles add/remove. When 2+
// items are in the list, surfaces a "Pogledaj usporedbu (N)" link.
export const CompareButton = ({ listingId }: Props) => {
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setActive(isInCompare(listingId));
      setCount(getCompareIds().length);
    };
    refresh();
    window.addEventListener('vozila:compare-updated', refresh);
    return () => window.removeEventListener('vozila:compare-updated', refresh);
  }, [listingId]);

  const compareUrl = `/usporedba?ids=${getCompareIds().join(',')}`;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => toggleCompare(listingId)}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 px-3 py-2 text-[10px] font-light uppercase tracking-[0.25em] border transition-colors ${
          active
            ? 'border-primary text-primary bg-primary/10'
            : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
        }`}
      >
        {active ? <Check className="w-3.5 h-3.5" strokeWidth={1.75} /> : <ArrowLeftRight className="w-3.5 h-3.5" strokeWidth={1.5} />}
        {active ? 'U usporedbi' : 'Dodaj u usporedbu'}
      </button>

      {count >= 2 && (
        <Link
          to={compareUrl}
          className="inline-flex items-center gap-1 text-[10px] font-light uppercase tracking-[0.25em] text-primary hover:underline"
        >
          Pogledaj usporedbu ({count})
        </Link>
      )}
    </div>
  );
};
