import React, { useRef, useState } from 'react';

type DropState = 'idle' | 'dragover' | 'uploading' | 'done' | 'error';

interface FileDropZoneProps {
  accept?: string;
  onFile: (file: File) => void | Promise<void>;
  label?: string;
  sublabel?: string;
  loading?: boolean;
  className?: string;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  accept,
  onFile,
  label = 'Dra och släpp en fil här',
  sublabel,
  loading = false,
  className = '',
}) => {
  const [state, setState] = useState<DropState>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setState('uploading');
    try {
      await onFile(file);
      setState('done');
    } catch {
      setState('error');
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setState('uploading');
    try {
      await onFile(file);
      setState('done');
    } catch {
      setState('error');
    }
  };

  const isActive = state === 'dragover';
  const isLoading = state === 'uploading' || loading;

  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-xl cursor-pointer
        transition-colors duration-150
        ${isActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'}
        ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={() => !isLoading && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setState('dragover'); }}
      onDragLeave={() => setState('idle')}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={isLoading}
      />
      {isLoading ? (
        <span className="text-slate-500 text-sm">Laddar upp...</span>
      ) : state === 'done' ? (
        <span className="text-green-600 text-sm font-medium">Uppladdad ✓</span>
      ) : state === 'error' ? (
        <span className="text-red-600 text-sm">Något gick fel — försök igen</span>
      ) : (
        <>
          <span className="text-slate-700 text-sm font-medium">{label}</span>
          {sublabel && <span className="text-slate-400 text-xs">{sublabel}</span>}
          <span className="text-slate-400 text-xs">eller klicka för att välja fil</span>
        </>
      )}
    </div>
  );
};
