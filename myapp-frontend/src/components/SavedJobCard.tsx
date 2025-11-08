import React from 'react';

interface SavedJobProps {
  jobTitle: string;
  company: string;
  location: string;
  tags: string[];
  status: string;
  appliedAt: string;
  expiresAt: string;
  jobUrl: string;
  notes?: string;
  actionItem?: boolean;
}

const SavedJobCard: React.FC<SavedJobProps> = ({
  jobTitle,
  company,
  location,
  tags,
  status,
  appliedAt,
  expiresAt,
  jobUrl,
  notes,
  actionItem,
}) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center gap-4 border border-slate-200 mb-3">
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <a href={jobUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline text-base">{jobTitle}</a>
        {actionItem && <span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-1 rounded ml-2">Action item</span>}
      </div>
      <div className="text-slate-600 text-sm mb-1">{company} | {location}</div>
      <div className="flex flex-wrap gap-2 mb-1">
        {tags.map(tag => (
          <span key={tag} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">{tag}</span>
        ))}
      </div>
      {notes && <div className="text-xs text-slate-500 italic mb-1">{notes}</div>}
    </div>
    <div className="flex flex-col items-end gap-1 min-w-[120px]">
      <div className="text-xs text-slate-400">Sökt: {appliedAt}</div>
      <div className="text-xs text-slate-400">Giltig till: {expiresAt}</div>
      <div className="text-xs text-green-700 font-semibold">{status}</div>
    </div>
  </div>
);

export default SavedJobCard;
