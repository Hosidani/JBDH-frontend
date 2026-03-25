
import React, { useRef, useState } from 'react';
import { Icon } from '../../ui/Icon';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileSelected, accept, disabled = false, className = '', style, children }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`relative transition border border-dashed rounded-lg ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${dragActive && !disabled ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'} ${className}`}
      style={style}
      onDragOver={e => { e.preventDefault(); if (!disabled) setDragActive(true); }}
      onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
      onDrop={handleDrop}
      onClick={() => { if (!disabled) inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={e => {
          if (e.target.files && e.target.files.length > 0) {
            onFileSelected(e.target.files[0]);
          }
        }}
      />
      {children}
      {disabled && (
        <div className="absolute inset-0 rounded-lg bg-slate-200/75 flex items-center justify-center">
          <Icon name="autorenew" size={40} className="animate-spin text-slate-500" />
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
