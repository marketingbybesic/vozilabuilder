import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { gradePhoto, type PhotoVerdict } from '../../lib/photoQuality';

interface Props {
  files: File[];
  label?: string;
}

// Photo quality nag — grades each uploaded photo client-side and surfaces
// up to 3 actionable tips per photo. A/B/C band shown as a tiny pill.
// Pure UX, no upload pipeline coupling.
export const PhotoQualityHints = ({ files, label = 'Slike' }: Props) => {
  const [verdicts, setVerdicts] = useState<(PhotoVerdict | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (files.length === 0) { setVerdicts([]); return; }
    setVerdicts(new Array(files.length).fill(null));
    (async () => {
      const out: PhotoVerdict[] = [];
      for (const f of files) {
        try { out.push(await gradePhoto(f)); }
        catch { out.push({ score: 50, band: 'B', tips: [] }); }
        if (cancelled) return;
        setVerdicts([...out, ...new Array(files.length - out.length).fill(null)]);
      }
    })();
    return () => { cancelled = true; };
  }, [files]);

  if (files.length === 0) return null;

  const avg = verdicts.filter((v): v is PhotoVerdict => !!v);
  const avgScore = avg.length ? Math.round(avg.reduce((a, v) => a + v.score, 0) / avg.length) : null;

  return (
    <div className="mt-4 border border-border bg-muted/20 p-4 sm:p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h4 className="text-[10px] font-light uppercase tracking-[0.3em] text-foreground">
          {label} — kvaliteta
        </h4>
        {avgScore !== null && (
          <span className="text-[10px] font-light uppercase tracking-[0.25em] text-muted-foreground tabular-nums">
            prosjek {avgScore}/100
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {files.map((f, i) => {
          const v = verdicts[i];
          if (!v) return (
            <li key={i} className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-block w-12 h-12 bg-muted animate-pulse" />
              <span>Analiziram {f.name}…</span>
            </li>
          );
          const tone = v.band === 'A' ? 'text-emerald-500'
                     : v.band === 'B' ? 'text-amber-500'
                     :                   'text-red-500';
          return (
            <li key={i} className="flex items-start gap-3">
              {v.band === 'A'
                ? <CheckCircle2 className={`w-4 h-4 mt-0.5 ${tone}`} strokeWidth={1.75} aria-hidden="true" />
                : <AlertCircle className={`w-4 h-4 mt-0.5 ${tone}`} strokeWidth={1.75} aria-hidden="true" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-light text-foreground truncate" title={f.name}>{f.name}</p>
                  <span className={`text-[10px] font-light uppercase tracking-[0.25em] tabular-nums ${tone}`}>
                    {v.band} · {v.score}/100
                  </span>
                </div>
                {v.tips.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {v.tips.map((t) => (
                      <li key={t} className="text-[11px] font-light text-muted-foreground leading-relaxed">
                        <span className="opacity-50">›</span> {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
