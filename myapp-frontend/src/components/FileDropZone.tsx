import React, { useRef, useState } from 'react';

interface FileDropZoneProps {
  label: string;
  description: string;
  onFileSelected: (file: File) => void;
  accept?: string;
  icon?: React.ReactNode;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ label, description, onFileSelected, accept, icon }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-slate-50 transition ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`}
      style={{ minHeight: 180, width: '100%', maxWidth: 320 }}
      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => {
          if (e.target.files && e.target.files.length > 0) {
            onFileSelected(e.target.files[0]);
          }
        }}
      />
      <div className="mb-2 text-4xl text-blue-400">
        {icon || (
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4" strokeDasharray="4 2" />
            <path d="M12 8v8m0 0l-3-3m3 3l3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="font-semibold mb-1 text-center">{label}</div>
      <div className="text-slate-500 text-sm text-center">{description}</div>
    </div>
  );
};

export default FileDropZone;
