import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageBackground, PageWrapper } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { Modal } from '../../components/common';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { TextInput } from '../../components/ui/TextInput';
import { CheckboxGroup } from '../../components/ui/CheckboxGroup';
import { Toggle } from '../../components/ui/Toggle';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useLocalAccount, useLocalCandidates, useLocalCVs } from '../../db/useLocalDb';
import { LocalDbService } from '../../db/LocalDbService';
import { ApiService } from '../../services/ApiService';
import { WORKPLACE_TYPES, EMPLOYMENT_TYPES } from '../../db/types';
import type { CV, WorkplaceType, EmploymentType } from '../../db/types';
import AddCvForCandidateModal from './AddCvForCandidateModal';
import oneOnOneImg from '../../assets/img/one-on-one.png';

interface FormState {
  name: string;
  email: string;
  telephone: string;
  title: string;
  location: string;
  workplace: WorkplaceType[];
  employment_type: EmploymentType[];
  available_from: string;
  travel: boolean;
  searchable: boolean;
}

const EMPTY: FormState = {
  name: '', email: '', telephone: '', title: '', location: '',
  workplace: [], employment_type: [], available_from: '',
  travel: false, searchable: false,
};

const CandidatePage: React.FC = () => {
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const { data: account, loading: accountLoading } = useLocalAccount();
  const { data: allCandidates } = useLocalCandidates(account?.account_id);

  // savedCandidateId: tracks when the candidate has been persisted (needed for CV section)
  const [savedCandidateId, setSavedCandidateId] = useState<string | null>(id ?? null);
  const localIdRef = useRef<string | null>(id ?? null);

  const { data: cvs, refresh: refreshCvs } = useLocalCVs(savedCandidateId ?? undefined);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loadError, setLoadError] = useState('');
  const [nameError, setNameError] = useState('');
  // CV section state
  const [cvChecked, setCvChecked] = useState<Set<string>>(new Set());
  const [addCvOpen, setAddCvOpen] = useState(false);
  const [editCv, setEditCv] = useState<CV | undefined>(undefined);
  const [confirmCvId, setConfirmCvId] = useState<string | null>(null);
  const [confirmCvBulk, setConfirmCvBulk] = useState(false);
  const [deletingCv, setDeletingCv] = useState(false);
  // CV text editor modal
  const [textEditCv, setTextEditCv] = useState<CV | null>(null);
  const [textEditValue, setTextEditValue] = useState('');
  const [textEditSaving, setTextEditSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    LocalDbService.getCandidate(id).then(c => {
      if (!c) { setLoadError('Kandidaten hittades inte.'); return; }
      setForm({
        name: c.name, email: c.email, telephone: c.telephone,
        title: c.title, location: c.location,
        workplace: c.workplace, employment_type: c.employment_type,
        available_from: c.available_from,
        travel: c.travel, searchable: c.searchable,
      });
    }).catch(() => setLoadError('Kunde inte läsa kandidaten.'));
  }, [id, isEdit]);

  const autoSave = useCallback(async (overrides: Partial<FormState> = {}) => {
    if (!account) return;
    const current: FormState = { ...form, ...overrides };
    if (!current.name.trim()) return;

    try {
      if (localIdRef.current) {
        await LocalDbService.updateCandidate(localIdRef.current, {
          name: current.name.trim(), email: current.email, telephone: current.telephone,
          title: current.title, location: current.location,
          workplace: current.workplace, employment_type: current.employment_type,
          available_from: current.available_from, travel: current.travel, searchable: current.searchable,
        });
      } else {
        const saved = await LocalDbService.addCandidate({
          account_id: account.account_id,
          name: current.name.trim(), email: current.email, telephone: current.telephone,
          title: current.title, location: current.location,
          workplace: current.workplace, employment_type: current.employment_type,
          available_from: current.available_from, travel: current.travel, searchable: current.searchable,
        });
        localIdRef.current = saved.candidate_id;
        setSavedCandidateId(saved.candidate_id);
      }
    } catch { /* silently ignore */ }
  }, [account, form]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // CV delete helpers
  const doDeleteCvs = async (ids: string[]) => {
    setDeletingCv(true);
    try {
      // Fetch CVs to get backend_id, then delete from backend (best-effort) and IndexedDB
      const cvRecords = await Promise.all(ids.map(id => LocalDbService.getCV(id)));
      await Promise.allSettled(
        cvRecords
          .filter((cv): cv is NonNullable<typeof cv> => !!cv?.backend_id)
          .map(cv => ApiService.deleteExternalCV(cv.backend_id!))
      );
      await Promise.all(ids.map(cvId => LocalDbService.deleteCV(cvId)));
      setCvChecked(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; });
      await refreshCvs();
    } catch { /* silently ignore */ }
    finally {
      setDeletingCv(false);
      setConfirmCvId(null);
      setConfirmCvBulk(false);
    }
  };

  const openTextEdit = (cv: CV) => {
    setTextEditCv(cv);
    setTextEditValue(cv.cv_anonymized);
  };

  const saveTextEdit = async () => {
    if (!textEditCv) return;
    setTextEditSaving(true);
    try {
      await LocalDbService.updateCV(textEditCv.cv_id, { cv_anonymized: textEditValue });
      await refreshCvs();
      setTextEditCv(null);
    } catch { /* silently ignore */ }
    finally { setTextEditSaving(false); }
  };

  const toggleCvCheck = (cvId: string) =>
    setCvChecked(prev => { const n = new Set(prev); n.has(cvId) ? n.delete(cvId) : n.add(cvId); return n; });

  const toggleAllCvs = () =>
    setCvChecked(prev => prev.size === cvs.length ? new Set() : new Set(cvs.map(c => c.cv_id)));

  const allCvsChecked = cvs.length > 0 && cvChecked.size === cvs.length;
  const someCvsChecked = cvChecked.size > 0;

  const mimeToFormat = (mime: string): string => {
    if (mime.includes('pdf')) return 'PDF';
    if (mime.includes('wordprocessingml') || mime.includes('docx')) return 'DOCX';
    if (mime.includes('rtf')) return 'RTF';
    if (mime.includes('markdown')) return 'MD';
    if (mime.includes('plain')) return 'TXT';
    return mime;
  };

  const mimeToExt = (mime: string): string => {
    if (mime.includes('pdf')) return '.pdf';
    if (mime.includes('wordprocessingml') || mime.includes('docx')) return '.docx';
    if (mime.includes('rtf')) return '.rtf';
    if (mime.includes('markdown')) return '.md';
    if (mime.includes('plain')) return '.txt';
    return '';
  };

  const downloadCv = (cv: CV) => {
    if (!cv.cv_file) return;
    const url = URL.createObjectURL(cv.cv_file);
    const a = document.createElement('a');
    a.href = url;
    a.download = (cv.cv_title || 'cv') + mimeToExt(cv.cv_file_type);
    a.click();
    URL.revokeObjectURL(url);
  };

  if (accountLoading) return null;

  return (
    <>
      <PageBackground imageUrl={oneOnOneImg} opacity={1} blur={0} className="!z-[2]" />
      <PageWrapper className="relative z-10">
        <div className="flex flex-col gap-6">

          {loadError && <p className="text-red-600 text-sm">{loadError}</p>}

          {/* Grunduppgifter */}
          <PageCard
            title={
              savedCandidateId && form.name.trim()
                ? `${tSync('candidate_form_page_title')} '${form.name.trim()}'`
                : tSync('candidate_form_create_title')
            }
            action={
              <button
                onClick={() => navigate('/candidate_mgmt')}
                className="text-sm text-blue-600 hover:underline"
              >
                {tSync('candidate_list_candidates')}
              </button>
            }
          >
            <div className="flex flex-col gap-4">
              <div>
                <TextInput
                  label={tSync('candidate_form_name')}
                  value={form.name}
                  helpText={tSync('candidate_form_name_help')}
                  onChange={v => { set('name', v); setNameError(''); }}
                  onBlur={() => {
                    if (!form.name.trim()) { setNameError(tSync('candidate_form_name_required')); return; }
                    autoSave();
                  }}
                />
                {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
              </div>
              <TextInput label={tSync('candidate_form_job_title')} helpText={tSync('candidate_form_job_title_help')} value={form.title}     onChange={v => set('title', v)}     onBlur={() => autoSave()} />
              <TextInput label={tSync('candidate_form_location')}  helpText={tSync('candidate_form_location_help')}  value={form.location}  onChange={v => set('location', v)}  onBlur={() => autoSave()} />
              <TextInput label={tSync('candidate_form_email')}     helpText={tSync('candidate_form_email_help')}     value={form.email}     onChange={v => set('email', v)}     onBlur={() => autoSave()} type="email" />
              <TextInput label={tSync('candidate_form_telephone')} helpText={tSync('candidate_form_telephone_help')} value={form.telephone} onChange={v => set('telephone', v)} onBlur={() => autoSave()} type="tel" />
            </div>
          </PageCard>

          {/* Preferenser */}
          <PageCard title="">
            <div className="flex flex-col gap-6">
              <CheckboxGroup
                label={tSync('candidate_form_workplace')}
                options={WORKPLACE_TYPES.map(w => ({ value: w, label: w }))}
                selected={form.workplace}
                onChange={vals => { const v = vals as WorkplaceType[]; set('workplace', v); autoSave({ workplace: v }); }}
                layout="row"
              />
              <CheckboxGroup
                label={tSync('candidate_form_employment_type')}
                options={EMPLOYMENT_TYPES.map(e => ({ value: e, label: e }))}
                selected={form.employment_type}
                onChange={vals => { const v = vals as EmploymentType[]; set('employment_type', v); autoSave({ employment_type: v }); }}
                layout="row"
              />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">{tSync('candidate_form_available_from')}</span>
                <input
                  type="date"
                  value={form.available_from}
                  onChange={e => set('available_from', e.target.value)}
                  onBlur={() => autoSave()}
                  className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
                />
              </div>
              <div className="flex gap-8">
                <Toggle
                  label={tSync('candidate_form_travel')}
                  checked={form.travel}
                  onChange={() => { const next = !form.travel; set('travel', next); autoSave({ travel: next }); }}
                />
                <Toggle
                  label={tSync('candidate_form_searchable')}
                  checked={form.searchable}
                  onChange={() => { const next = !form.searchable; set('searchable', next); autoSave({ searchable: next }); }}
                />
              </div>
            </div>
          </PageCard>

          {/* Kandidatens CV — visas när kandidaten är sparad */}
          {savedCandidateId && (
            <PageCard
              title={`${tSync('candidate_cv_section_title')} "${form.name.trim() || '...'}"`}
              action={
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditCv(undefined); setAddCvOpen(true); }}
                    title={tSync('candidate_cv_add_title')}
                    className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Icon name="add" size={22} />
                  </button>
                  <button
                    onClick={() => someCvsChecked && setConfirmCvBulk(true)}
                    disabled={!someCvsChecked}
                    title={tSync('candidate_cv_delete_confirm_title')}
                    className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Icon name="delete" size={22} />
                  </button>
                </div>
              }
            >
              {cvs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">{tSync('candidate_cv_empty')}</p>
              ) : (
                <ul className="flex flex-col divide-y divide-slate-100">
                  <li className="flex items-center gap-3 py-2 px-1">
                    <input
                      type="checkbox"
                      checked={allCvsChecked}
                      onChange={toggleAllCvs}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-400 select-none">{tSync('jac_select_all')}</span>
                  </li>
                  {cvs.map(cv => (
                    <li
                      key={cv.cv_id}
                      onClick={() => { setEditCv(cv); setAddCvOpen(true); }}
                      className="group flex items-center gap-3 py-2.5 px-1 hover:bg-slate-50 rounded-md cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={cvChecked.has(cv.cv_id)}
                        onChange={e => { e.stopPropagation(); toggleCvCheck(cv.cv_id); }}
                        onClick={e => e.stopPropagation()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-slate-700 truncate">
                            {cv.cv_title || 'CV'}
                          </span>
                          {cv.cv_published ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
                              {tSync('cv_status_published')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white text-slate-500 border border-slate-300 whitespace-nowrap">
                              {tSync('cv_status_unpublished')}
                            </span>
                          )}
                        </div>
                        {cv.cv_file_type && (
                          <span className="block text-xs text-slate-400">{mimeToFormat(cv.cv_file_type)}</span>
                        )}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); openTextEdit(cv); }}
                        title={tSync('candidate_cv_view_text')}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex-shrink-0"
                      >
                        <Icon name="visibility" size={18} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setEditCv(cv); setAddCvOpen(true); }}
                        title={tSync('candidate_cv_edit_title')}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex-shrink-0"
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      {cv.cv_file && (
                        <button
                          onClick={e => { e.stopPropagation(); downloadCv(cv); }}
                          title={tSync('candidate_cv_download')}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex-shrink-0"
                        >
                          <Icon name="download" size={18} />
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmCvId(cv.cv_id); }}
                        title={tSync('candidate_cv_delete_confirm_title')}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex-shrink-0"
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </PageCard>
          )}

        </div>
      </PageWrapper>

      {/* Lägg till / redigera CV */}
      {savedCandidateId && (
        <AddCvForCandidateModal
          open={addCvOpen}
          onClose={() => { setAddCvOpen(false); setEditCv(undefined); }}
          defaultCandidateId={savedCandidateId}
          candidates={allCandidates}
          editCv={editCv}
          onSaved={() => { refreshCvs(); setAddCvOpen(false); setEditCv(undefined); }}
        />
      )}

      {/* Bekräfta radera enskilt CV */}
      <Modal open={confirmCvId !== null} onClose={() => setConfirmCvId(null)} title={tSync('candidate_cv_delete_confirm_title')}>
        <p className="text-sm text-slate-600 mb-6">{tSync('candidate_cv_delete_confirm_message')}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={() => setConfirmCvId(null)}>{tSync('button_cancel')}</Button>
          <Button variant="danger" size="lg" loading={deletingCv} onClick={() => doDeleteCvs([confirmCvId!])}>
            {tSync('jac_delete_confirm_ok')}
          </Button>
        </div>
      </Modal>

      {/* Bekräfta bulk-radera CVn */}
      <Modal open={confirmCvBulk} onClose={() => setConfirmCvBulk(false)} title={tSync('candidate_cv_delete_confirm_title')}>
        <p className="text-sm text-slate-600 mb-6">{tSync('candidate_cv_delete_confirm_message')}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={() => setConfirmCvBulk(false)}>{tSync('button_cancel')}</Button>
          <Button variant="danger" size="lg" loading={deletingCv} onClick={() => doDeleteCvs([...cvChecked])}>
            {tSync('jac_delete_confirm_ok')}
          </Button>
        </div>
      </Modal>

      {/* Visa / redigera CV-text */}
      <Modal
        open={textEditCv !== null}
        onClose={() => setTextEditCv(null)}
        title={textEditCv?.cv_title || 'CV'}
        maxWidth="max-w-3xl"
      >
        <textarea
          value={textEditValue}
          onChange={e => setTextEditValue(e.target.value)}
          rows={20}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono leading-relaxed"
        />
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="ghost" size="lg" onClick={() => setTextEditCv(null)}>
            {tSync('button_cancel')}
          </Button>
          <Button variant="primary" size="lg" loading={textEditSaving} onClick={saveTextEdit}>
            {tSync('button_save')}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default CandidatePage;
