import React, { useState } from 'react';
import { Modal } from '../../components/common';
import FileDropZone from '../../components/common/inputs/FileDropZone';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../hooks/TranslationProvider';

interface UploadProfileCvModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const UploadProfileCvModal: React.FC<UploadProfileCvModalProps> = ({ open, onClose, onUpload }) => {
  const { tSync } = useTranslation();
  const [file, setFile] = useState<File | null>(null);

  React.useEffect(() => {
    if (open) setFile(null);
  }, [open]);

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  const handleSave = () => {
    if (!file) return;
    onUpload(file);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={tSync('jac_add_cv_title')}>
      <div className="flex flex-col gap-4">
        <FileDropZone
          onFileSelected={setFile}
          accept=".pdf,.docx"
          className="p-6 text-center"
        >
          <div className="flex flex-col items-center gap-2 text-slate-500 text-sm">
            {file ? (
              <span className="text-slate-700 font-medium">{file.name}</span>
            ) : (
              <>
                <span className="text-2xl">📄</span>
                <span>{tSync('jac_add_cv_dropzone')}</span>
              </>
            )}
          </div>
        </FileDropZone>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={handleClose}>{tSync('jac_modal_cancel')}</Button>
          <Button variant="primary" size="lg" disabled={!file} onClick={handleSave}>
            {tSync('jac_add_cv_save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadProfileCvModal;
