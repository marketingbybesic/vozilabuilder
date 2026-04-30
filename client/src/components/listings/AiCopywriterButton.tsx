import { useState } from 'react';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';

interface Props {
  attributes: Record<string, any>;
  title?: string;
  onGenerated: (text: string) => void;
}

// AI copywriter button — calls the server /api/copywriter (Claude Haiku) with
// the listing's structured attributes and pipes the generated description
// back into the form. Inline-disabled when API isn't configured server-side.
export const AiCopywriterButton = ({ attributes, title, onGenerated }: Props) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/copywriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: attributes.make,
          model: attributes.model,
          year: attributes.year,
          mileage: attributes.mileage,
          fuel: attributes.fuel,
          transmission: attributes.transmission,
          power_hp: attributes.power_hp,
          body_type: attributes.body_type,
          color: attributes.color,
          condition: attributes.condition,
          equipment: attributes.equipment || [],
          title,
          language: 'hr',
        }),
      });
      if (res.status === 503) {
        setError('AI generator nije konfiguriran (potreban ANTHROPIC_API_KEY).');
        return;
      }
      if (!res.ok) {
        setError(`Greška ${res.status}. Pokušajte ponovno.`);
        return;
      }
      const j = await res.json();
      if (j?.description) onGenerated(j.description);
    } catch (e: any) {
      setError(e?.message || 'Mreža nije dostupna');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="inline-flex items-center gap-2 px-4 h-10 bg-primary/10 border border-primary/40 text-primary text-[10px] font-light uppercase tracking-[0.25em] hover:bg-primary/20 disabled:opacity-50 transition-colors"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
        {busy ? 'Generiram opis…' : 'Generiraj AI opis'}
        {!busy && <Sparkles className="w-3 h-3 opacity-60" />}
      </button>
      {error && <p className="text-[10px] text-muted-foreground/80">{error}</p>}
    </div>
  );
};
