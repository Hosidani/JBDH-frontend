export function ScoreMeter({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct <= 25 ? 'bg-red-500' :
    pct <= 55 ? 'bg-orange-400' :
    pct <= 74 ? 'bg-yellow-300' :
    pct <= 86 ? 'bg-lime-300' :
    'bg-green-500';
  return (
    <div className="w-full bg-slate-100 rounded-full h-6 overflow-hidden">
      <div className={`h-6 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
