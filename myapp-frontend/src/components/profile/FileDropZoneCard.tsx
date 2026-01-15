import React from 'react';
import IconCvDocument from '../icon_library/IconCvDocument';
import IconLetterDocument from '../icon_library/IconLetterDocument';
import { FileDropZone } from '../common';

interface FileDropZoneCardProps {
  tSync: (key: string) => string;
  handleCVUpload: (file: File) => void;
  cvUploaded?: boolean;
  coverLetterUploaded?: boolean;
}



const FileDropZoneCard: React.FC<FileDropZoneCardProps> = ({ tSync, handleCVUpload, cvUploaded = false, coverLetterUploaded = false }) => (
  <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
    {/* CV Card */}
    <FileDropZone accept=".pdf" onFileSelected={handleCVUpload} className="flex-1 border border-slate-300 rounded-lg p-6 flex flex-col bg-white min-w-[340px] max-w-[420px] justify-between cursor-pointer transition hover:shadow-md" style={{ minHeight: 340 }}>
      <div className="flex flex-col items-center mb-2 pointer-events-none">
        {/* Icon with check if uploaded */}
        <div className="relative mb-2">
          <IconCvDocument className={`w-14 h-14 ${cvUploaded ? '' : ''}`} />
          {cvUploaded && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#22c55e"/><path d="M6 10.5l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          )}
        </div>
        <div className="font-bold text-xl text-center leading-tight">{tSync('profilePage_cv_dropzone_label')}</div>
        <div className="text-slate-400 text-sm mt-1 text-center">För att lägga till eller uppdatera</div>
      </div>
      <div className="flex-1" />
      <div className="text-slate-600 text-sm mt-4 italic text-left pointer-events-none">
        PDF:en som laddas upp behandlas av AI och listan med kompetenser populas. Ditt CV delas aldrig med tredje part. Klicka på ikonen för att se ditt uppladdade CV. Ändra genom att ladda upp ny PDF
      </div>
    </FileDropZone>
    {/* Cover Letter Card */}
    <FileDropZone accept=".pdf" onFileSelected={() => {}} className="flex-1 border border-slate-300 rounded-lg p-6 flex flex-col bg-white min-w-[340px] max-w-[420px] justify-between cursor-pointer transition hover:shadow-md" style={{ minHeight: 340 }}>
      <div className="flex flex-col items-center mb-2 pointer-events-none">
        <IconLetterDocument className={`w-14 h-14 ${coverLetterUploaded ? '' : 'opacity-60'}`} />
        <div className="font-bold text-xl text-center leading-tight">{tSync('profilePage_coverletter_dropzone_label')}</div>
        <div className="text-slate-400 text-sm mt-1 text-center">För att lägga till eller uppdatera</div>
      </div>
      <div className="flex-1" />
      <div className="text-slate-600 text-sm mt-4 italic text-left pointer-events-none">
        PDF:en som laddas upp behandlas av AI och listan med kompetenser populas. Ditt brev delas aldrig med tredje part. Klicka på ikonen för att se ditt uppladdade brev. Ändra genom att ladda upp ny PDF
      </div>
    </FileDropZone>
  </div>
);

export default FileDropZoneCard;
