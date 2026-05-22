import type { Bilingual } from '../../types/analysis';

export interface FieldAnalysis {
  field_overlap_score: number;
  field_distance_note?: string | Bilingual;
  match_evidence?: (string | Bilingual)[];
  transferable_skills?: (string | Bilingual)[];
  critical_gaps?: (string | Bilingual)[];
}

/** Resolve a bilingual value to a plain string for the given language. */
function resolveLang(value: string | Bilingual | undefined, lang: string): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return lang === 'en' ? (value.en || value.sv) : (value.sv || value.en);
}

interface PillRowProps {
  label: string;
  items: (string | Bilingual)[];
  colorClass: string;
  lang: string;
}

function PillRow({ label, items, colorClass, lang }: PillRowProps) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="mb-2">
      <p className={`text-xs font-semibold mb-1 ${colorClass}`}>{label}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span key={i} className={`px-2 py-0.5 text-xs rounded-full ${colorClass.replace('text-', 'bg-').replace('-700', '-100')} ${colorClass}`}>
            {resolveLang(item, lang)}
          </span>
        ))}
      </div>
    </div>
  );
}

interface Props {
  fieldAnalysis: FieldAnalysis;
  lang?: string;
  className?: string;
}

export function FieldAnalysisCard({ fieldAnalysis, lang = 'sv', className = '' }: Props) {
  const overlapLabel = lang === 'en' ? 'Field Overlap' : 'Fältöverlapp';
  const evidenceLabel = lang === 'en' ? 'Overlapping hard skills' : 'Överlappande hard skills';
  const transferLabel = lang === 'en' ? 'Transferable skills' : 'Transfererbara skills';
  const gapsLabel = lang === 'en' ? 'Critical gaps' : 'Kritiska luckor';

  return (
    <div className={`mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl font-black text-blue-700">
          {fieldAnalysis.field_overlap_score}%
        </span>
        <span className="font-semibold text-slate-700">{overlapLabel}</span>
      </div>
      {fieldAnalysis.field_distance_note && (
        <p className="text-sm text-slate-600 mb-3">{resolveLang(fieldAnalysis.field_distance_note, lang)}</p>
      )}
      <PillRow label={evidenceLabel} items={fieldAnalysis.match_evidence ?? []} colorClass="text-green-700" lang={lang} />
      <PillRow label={transferLabel} items={fieldAnalysis.transferable_skills ?? []} colorClass="text-blue-700" lang={lang} />
      <PillRow label={gapsLabel} items={fieldAnalysis.critical_gaps ?? []} colorClass="text-red-700" lang={lang} />
    </div>
  );
}
