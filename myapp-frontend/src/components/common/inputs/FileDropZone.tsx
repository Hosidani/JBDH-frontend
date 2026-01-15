
import React, { useRef, useState } from 'react';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileSelected, accept, className = '', style, children }) => {
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
      className={`relative transition border border-dashed rounded-lg cursor-pointer ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'} ${className}`}
      style={style}
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
      {children}
    </div>
  );
};

export default FileDropZone;
