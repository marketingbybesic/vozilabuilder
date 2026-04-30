import { useState } from 'react';
import { Loader2, ScanLine, Check, AlertCircle } from 'lucide-react';
import { decodeVin, isValidVin, type VinResult } from '../../lib/vinDecoder';

interface Props {
  onDecoded: (vin: VinResult) => void;
  initialValue?: string;
}

// VIN quick-fill — drop-in module for the seller wizard. Magic-moment UX:
// paste a VIN, press the button, watch make/model/year/engine fly into the
// form. Renders inline status (loading / success / error).
export const VinQuickFill = ({ onDecoded, initialValue = '' }: Props) => {
  const [vin, setVin] = useState(initialValue);
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [decoded, setDecoded] = useState<VinResult | null>(null);

  const handleDecode = async () => {
    setMessage('');
    setStatus('loading');
    const r = await decodeVin(vin);
    if ('error' in r) {
      setStatus('error');
      setMessage(r.error);
      return;
    }
    if (!r.make && !r.model && !r.year) {
      setStatus('error');
      setMessage('VIN dekodiran, ali nema dovoljno podataka. Provjerite VIN ili unesite ručno.');
      return;
    }
    setStatus('success');
    setDecoded(r);
    setMessage(buildHumanSummary(r));
    onDecoded(r);
  };

  const valid = isValidVin(vin);

  return (
    <div className="border border-border bg-muted/20 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <ScanLine className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <h3 className="text-[11px] font-light uppercase tracking-[0.3em] text-foreground">
          VIN auto-popuna
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Unesite 17-znamenkasti VIN i polja se popunjavaju automatski (marka, model, godište, motor).
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={vin}
          onChange={(e) => { setVin(e.target.value.toUpperCase()); setStatus('idle'); }}
          placeholder="WBA3D9C53FK162345"
          maxLength={17}
          spellCheck={false}
          autoCapitalize="characters"
          aria-label="VIN broj vozila"
          className="flex-1 h-11 px-3 bg-background border border-border text-foreground placeholder:text-muted-foreground/50 text-sm font-light tabular-nums tracking-widest focus:outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={handleDecode}
          disabled={!valid || status === 'loading'}
          className="h-11 px-5 bg-primary text-primary-foreground text-[10px] font-light uppercase tracking-[0.25em] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
        >
          {status === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ScanLine className="w-3.5 h-3.5" />}
          {status === 'loading' ? 'Dekodiranje…' : 'Dekodiraj'}
        </button>
      </div>

      {/* Status */}
      {status === 'success' && (
        <div className="mt-4 flex items-start gap-2 text-xs text-foreground">
          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
          <span className="leading-relaxed">{message}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
          <span className="leading-relaxed">{message}</span>
        </div>
      )}

      {/* Decoded preview chips */}
      {status === 'success' && decoded && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {[
            decoded.year && `${decoded.year}`,
            decoded.make,
            decoded.model,
            decoded.engine_cc && `${decoded.engine_cc}ccm`,
            decoded.fuel,
            decoded.body_type,
            decoded.drivetrain,
            decoded.doors && `${decoded.doors} vrata`,
          ].filter(Boolean).map((chip, i) => (
            <span key={i} className="px-2 py-1 text-[10px] font-light uppercase tracking-[0.2em] border border-border text-muted-foreground">
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

function buildHumanSummary(r: VinResult): string {
  const parts: string[] = [];
  if (r.year && r.make && r.model) parts.push(`${r.year} ${r.make} ${r.model}`);
  if (r.engine_cc) parts.push(`${r.engine_cc} ccm`);
  if (r.fuel) parts.push(r.fuel.toLowerCase());
  return parts.length ? `Pronađeno: ${parts.join(' · ')}.` : 'VIN dekodiran.';
}
