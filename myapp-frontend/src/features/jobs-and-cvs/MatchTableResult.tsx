import React, { useState, useMemo } from 'react';
import { type SelectableItem } from './SelectableListSection';
import noWayImg from '../../assets/graphics/NoWay.png';
import poorImg from '../../assets/graphics/Poor.png';
import notLikelyImg from '../../assets/graphics/NotLikely.png';
import fairImg from '../../assets/graphics/Fair.png';
import excelentImg from '../../assets/graphics/Excelent.png';

function scoreImage(score: number): string {
  if (score <= 25) return noWayImg;
  if (score <= 55) return poorImg;
  if (score <= 74) return notLikelyImg;
  if (score <= 86) return fairImg;
  return excelentImg;
}

export interface MatchRow {
  job: SelectableItem;
  cv: SelectableItem;
  score: number | null;
  atsResultId?: number;
}

type SortKey = 'job' | 'cv' | 'score';
type SortDir = 'asc' | 'desc';

interface MatchTableResultProps {
  rows: MatchRow[];
  jobLabel: string;
  cvLabel: string;
  scoreLabel: string;
  emptyLabel: string;
  onRowClick?: (atsResultId: number) => void;
}

const SortIcon: React.FC<{ active: boolean; dir: SortDir }> = ({ active, dir }) => (
  <span className={`ml-1 text-xs ${active ? 'text-blue-600' : 'text-slate-300'}`}>
    {active && dir === 'desc' ? '▼' : '▲'}
  </span>
);

const MatchTableResult: React.FC<MatchTableResultProps> = ({
  rows,
  jobLabel,
  cvLabel,
  scoreLabel,
  emptyLabel,
  onRowClick,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'score' ? 'desc' : 'asc');
    }
  };

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const scoreA = a.score ?? -Infinity;
      const scoreB = b.score ?? -Infinity;
      if (sortKey === 'job') {
        const primary = a.job.name.localeCompare(b.job.name, 'sv') * dir;
        return primary !== 0 ? primary : scoreB - scoreA;
      }
      if (sortKey === 'cv') {
        const primary = a.cv.name.localeCompare(b.cv.name, 'sv') * dir;
        return primary !== 0 ? primary : scoreB - scoreA;
      }
      return (scoreA - scoreB) * dir;
    });
  }, [rows, sortKey, sortDir]);

  if (rows.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-6">{emptyLabel}</p>;
  }

  const thClass = 'text-left text-slate-500 font-semibold pb-3 pr-4 cursor-pointer select-none hover:text-blue-600 transition-colors';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className={thClass} onClick={() => handleSort('job')}>
              {jobLabel}<SortIcon active={sortKey === 'job'} dir={sortDir} />
            </th>
            <th className={thClass} onClick={() => handleSort('cv')}>
              {cvLabel}<SortIcon active={sortKey === 'cv'} dir={sortDir} />
            </th>
            <th className={`${thClass} text-right`} onClick={() => handleSort('score')}>
              {scoreLabel}<SortIcon active={sortKey === 'score'} dir={sortDir} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const clickable = !!row.atsResultId && !!onRowClick;
            return (
              <tr
                key={i}
                className={`border-t border-slate-100 hover:bg-blue-50 ${clickable ? 'cursor-pointer' : ''}`}
                onClick={clickable ? () => onRowClick!(row.atsResultId!) : undefined}
              >
                <td className="py-2 pr-4 text-slate-700 truncate max-w-[220px]">{row.job.name}</td>
                <td className="py-2 pr-4 text-slate-700 truncate max-w-[220px]">{row.cv.name}</td>
                <td className="py-2 text-right">
                  {row.score != null
                    ? <img src={scoreImage(row.score)} alt={`${Math.round(row.score)}%`} title={`${Math.round(row.score)}%`} className="h-8 w-auto object-contain inline-block" />
                    : <span className="text-slate-400">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MatchTableResult;
