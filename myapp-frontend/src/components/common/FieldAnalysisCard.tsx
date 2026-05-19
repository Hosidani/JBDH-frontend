export interface FieldAnalysis {
  field_overlap_score: number;
  field_distance_note?: string;
  match_evidence?: string[];
  transferable_skills?: string[];
  critical_gaps?: string[];
}

interface PillRowProps {
  label: string;
  items: string[];
  colorClass: string;
}

function PillRow({ label, items, colorClass }: PillRowProps) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="mb-2">
      <p className={`text-xs font-semibold mb-1 ${colorClass}`}>{label}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span key={i} className={`px-2 py-0.5 text-xs rounded-full ${colorClass.replace('text-', 'bg-').replace('-700', '-100')} ${colorClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

interface Props {
  fieldAnalysis: FieldAnalysis;
  className?: string;
}

export function FieldAnalysisCard({ fieldAnalysis, className = '' }: Props) {
  return (
    <div className={`mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl font-black text-blue-700">
          {fieldAnalysis.field_overlap_score}%
        </span>
        <span className="font-semibold text-slate-700">Fältöverlapp</span>
      </div>
      {fieldAnalysis.field_distance_note && (
        <p className="text-sm text-slate-600 mb-3">{fieldAnalysis.field_distance_note}</p>
      )}
      <PillRow
        label="Överlappande hard skills"
        items={fieldAnalysis.match_evidence ?? []}
        colorClass="text-green-700"
      />
      <PillRow
        label="Transfererbara skills"
        items={fieldAnalysis.transferable_skills ?? []}
        colorClass="text-blue-700"
      />
      <PillRow
        label="Kritiska luckor"
        items={fieldAnalysis.critical_gaps ?? []}
        colorClass="text-red-700"
      />
    </div>
  );
}
