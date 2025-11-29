
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IconSettings from './icon_library/IconSettings';
import IconEditPen from './icon_library/IconEditPen';

interface ProfileInfoCardProps {
  name: string;
  registrationDate: string;
  title: string;
  employmentType: string;
  location: string;
  region: string;
  phone: string;
  email: string;
  tags: string[];
}

const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

const ToggleSwitch = ({ checked, onChange, label, yesLabel, noLabel }: { checked: boolean; onChange: () => void; label: string; yesLabel: string; noLabel: string }) => (
  <div className="flex flex-col items-center gap-1 min-w-[70px]">
    <span className="font-semibold text-slate-700 text-xs mb-1">{label}</span>
    <div className="flex items-center gap-1">
      <span className={`text-xs font-bold ${!checked ? 'text-slate-700' : 'text-slate-400'}`}>{noLabel}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-colors duration-200"></div>
        <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`}></div>
      </label>
      <span className={`text-xs font-bold ${checked ? 'text-slate-700' : 'text-slate-400'}`}>{yesLabel}</span>
    </div>
  </div>
);

const OutlinedCheckbox = ({ label, checked, onChange, stacked = false }: { label: string; checked: boolean; onChange: () => void; stacked?: boolean }) => (
  <label
    className={`flex ${stacked ? 'flex-col items-center justify-center' : 'flex-row items-center'} gap-0 px-4 py-2 border-2 rounded-xl cursor-pointer text-base font-semibold transition-all duration-150 min-w-[110px] min-h-[48px] 
      ${checked ? 'border-slate-400 bg-white' : 'border-slate-200 bg-white'} 
      hover:border-slate-400`}
    style={{ boxShadow: checked ? '0 0 0 2px #64748b' : undefined }}
  >
    <span
      className={`inline-block w-5 h-5 border-2 rounded-md flex items-center justify-center mb-1 mt-1 ${checked ? 'border-slate-700 bg-white' : 'border-slate-300 bg-white'}`}
      style={{ fontWeight: 700 }}
    >
      {checked && <span className="text-lg leading-none text-slate-700">&#10005;</span>}
    </span>
    <span className={`text-slate-700 text-sm font-semibold ${stacked ? 'text-center' : ''}`}>{label}</span>
    <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
  </label>
);

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  name,
  registrationDate,
  title,
  employmentType,
  location,
  region,
  phone,
  email,
  tags,
}) => {
  const [searchable, setSearchable] = useState(false);
  const [willingToTravel, setWillingToTravel] = useState(false);
  const [workplace, setWorkplace] = useState({ onSite: false, hybrid: false, remote: false });
  const navigate = useNavigate();

  return (
    <section className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-4 border border-slate-200 max-w-3xl mx-auto relative overflow-x-auto">
      {/* Top row: Avatar left, Info grid right, Cogwheel top right */}
      <div className="flex flex-row w-full gap-6 mb-2 items-start">
        {/* Avatar and registration */}
        <div className="flex flex-col items-center min-w-[96px]">
          <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-600 mb-2">
            {initials(name)}
          </div>
          <div className="text-xs text-slate-300 font-normal">Registrerad: {registrationDate}</div>
        </div>
        {/* Info grid and cogwheel */}
        <div className="flex-1 flex flex-col items-end">
          <div className="w-full flex flex-row justify-end">
            <button
              type="button"
              aria-label="Inställningar"
              onClick={() => navigate('/settings')}
              className="mb-2 mr-1"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <IconSettings className="w-[22px] h-[22px] opacity-70 hover:opacity-100" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 w-full">
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">Namn</div>
              <div className="font-bold text-lg text-slate-900">{name}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">Titel</div>
              <div className="font-bold text-lg text-slate-900">{title}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">Önskad anställningsform</div>
              <div className="font-bold text-lg text-slate-900">{employmentType}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">Tillgänglig från</div>
              <div className="font-bold text-lg text-slate-900">{registrationDate}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">Telefon</div>
              <div className="font-bold text-lg text-slate-900">{phone}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">Email</div>
              <div className="font-bold text-lg text-slate-900">{email}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">Önskad Ort</div>
              <div className="font-bold text-lg text-slate-900">{location}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">Område</div>
              <div className="font-bold text-lg text-slate-900">{region}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Toggles and workplace switches in a single row, with label above checkboxes only */}
      <div className="flex flex-row items-end gap-6 mt-4 w-full">
        <ToggleSwitch checked={searchable} onChange={() => setSearchable(v => !v)} label="Sökbar" yesLabel="JA" noLabel="NEJ" />
        <ToggleSwitch checked={willingToTravel} onChange={() => setWillingToTravel(v => !v)} label="Resbar" yesLabel="JA" noLabel="NEJ" />
        <div className="relative flex flex-col items-center ml-8">
          <span className="text-xs text-slate-400 font-normal mb-1 text-center absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">Önskad arbetsplats</span>
          <div className="flex flex-row items-end gap-2 min-h-[48px]">
            <OutlinedCheckbox label="På plats" checked={workplace.onSite} onChange={() => setWorkplace(w => ({ ...w, onSite: !w.onSite }))} stacked={false} />
            <OutlinedCheckbox label="Hybrid" checked={workplace.hybrid} onChange={() => setWorkplace(w => ({ ...w, hybrid: !w.hybrid }))} stacked={false} />
            <OutlinedCheckbox label="Distans" checked={workplace.remote} onChange={() => setWorkplace(w => ({ ...w, remote: !w.remote }))} stacked={false} />
          </div>
        </div>
      </div>
      {/* Kompetenser */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-bold text-slate-700">Kompetenser</div>
          <IconEditPen className="opacity-60" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(() => {
            // Separate hard and soft skills by simple heuristics (customize as needed)
            const hard = tags.filter(tag => !/team|communication|leadership|collaboration|coaching|mentoring|conflict|process|planning|problem|stakeholder|cross/i.test(tag));
            const soft = tags.filter(tag => /team|communication|leadership|collaboration|coaching|mentoring|conflict|process|planning|problem|stakeholder|cross/i.test(tag));
            const maxLen = Math.max(hard.length, soft.length);
            const interleaved: { value: string; type: 'hard' | 'soft' }[] = [];
            for (let i = 0; i < maxLen; i++) {
              if (i < hard.length) interleaved.push({ value: hard[i], type: 'hard' });
              if (i < soft.length) interleaved.push({ value: soft[i], type: 'soft' });
            }
            return interleaved.map((tag, idx) => (
              <span
                key={tag.value + idx}
                className={
                  `border-2 px-3 py-1 rounded-lg text-sm font-semibold bg-white ` +
                  (tag.type === 'hard'
                    ? 'border-blue-400 text-blue-700'
                    : 'border-green-400 text-green-700')
                }
              >
                {tag.value}
              </span>
            ));
          })()}
        </div>
      </div>
    </section>
  );
};

export default ProfileInfoCard;
