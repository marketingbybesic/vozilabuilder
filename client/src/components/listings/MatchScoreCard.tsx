import { Sparkles, ShieldCheck, Camera, FileText, Wrench } from 'lucide-react';
import { matchScore } from '../../lib/matchScore';
import type { Listing } from '../../types';

// MatchScoreCard — readable breakdown of how this listing scored.
// Visible on VDP. Drives sellers to fix what's missing (more photos,
// fuller description, verified VIN, registered, service history).
export const MatchScoreCard = ({ listing }: { listing: Listing }) => {
  const { total, band, reasons } = matchScore(listing);
  const tone =
    band === 'Premium' ? 'border-primary text-primary bg-primary/5' :
    band === 'Solid'   ? 'border-foreground/40 text-foreground bg-foreground/5' :
                          'border-muted text-muted-foreground bg-muted/30';

  // Hint copy if anything's clearly missing
  const tips: string[] = [];
  const imgs = (listing.listing_images || []).length;
  if (imgs < 4) tips.push(`Dodajte još fotografija (${imgs}/8 idealno).`);
  const desc = listing.description || '';
  if (desc.length < 200) tips.push('Proširite opis (idealno 200+ znakova).');
  const attrs = (listing.attributes || {}) as Record<string, any>;
  const filled = Object.values(attrs).filter(v => v !== null && v !== undefined && v !== '').length;
  if (filled < 8) tips.push('Popunite više specifikacija.');
  if (!attrs.service_history) tips.push('Dodajte servisnu knjigu kao trust signal.');

  return (
    <div className={`p-5 lg:p-6 border ${tone}`}>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="text-[10px] font-light uppercase tracking-[0.3em]">
            Match Score
          </h3>
        </div>
        <span className="text-[9px] font-light uppercase tracking-[0.25em] opacity-70">
          {band}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-light tabular-nums">{total}</span>
        <span className="text-sm opacity-60 tabular-nums">/100</span>
      </div>

      {/* Hairline progress */}
      <div className="mt-4 h-px bg-border relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-current transition-[width] duration-700"
          style={{ width: `${total}%` }}
        />
      </div>

      {/* Reason chips */}
      {reasons.length > 0 && (
        <div className="mt-5">
          <p className="text-[9px] font-light uppercase tracking-[0.25em] opacity-60 mb-2">
            Što povisuje rezultat
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {reasons.map((r) => (
              <li key={r} className="px-2 py-1 text-[10px] font-light uppercase tracking-[0.2em] border border-current/30">
                <IconForReason reason={r} />
                <span className="ml-1.5">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips for sellers */}
      {tips.length > 0 && (
        <div className="mt-5 pt-5 border-t border-current/20">
          <p className="text-[9px] font-light uppercase tracking-[0.25em] opacity-60 mb-2">
            Kako do 100
          </p>
          <ul className="space-y-1.5">
            {tips.slice(0, 3).map((t) => (
              <li key={t} className="text-xs font-light leading-relaxed opacity-90 flex items-start gap-2">
                <span className="opacity-50 mt-0.5">›</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

function IconForReason({ reason }: { reason: string }) {
  if (reason.includes('fotografija')) return <Camera className="inline w-3 h-3" strokeWidth={1.5} />;
  if (reason.includes('opis')) return <FileText className="inline w-3 h-3" strokeWidth={1.5} />;
  if (reason.includes('specifik')) return <Wrench className="inline w-3 h-3" strokeWidth={1.5} />;
  if (reason.includes('Verificirani') || reason.includes('Servisna') || reason.includes('vlasnik')) return <ShieldCheck className="inline w-3 h-3" strokeWidth={1.5} />;
  return <Sparkles className="inline w-3 h-3" strokeWidth={1.5} />;
}
