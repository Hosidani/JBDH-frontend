import React, { useState } from 'react';
import { useTranslation } from '../hooks/TranslationProvider';
import { ApiService } from '../services/ApiService';
import { useNavigate } from 'react-router-dom';
import IconSettings from './icon_library/IconSettings';
import IconEditPen from './icon_library/IconEditPen';

interface ProfileInfoCardProps {
  name: string;
  createdAt?: string;
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
      className={`w-5 h-5 border-2 rounded-md flex items-center justify-center mb-1 mt-1 ${checked ? 'border-slate-700 bg-white' : 'border-slate-300 bg-white'}`}
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
  createdAt,
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
  const { tSync } = useTranslation();

  React.useEffect(() => {
    ApiService.getMyProfile().then(profile => {
      // Backend returns camelCase properties via System.Text.Json
      setSearchable(!!profile.searchable);
      setWillingToTravel(!!profile.travelAvailability);
      const modes: string[] = Array.isArray(profile.desiredWorkModes)
        ? profile.desiredWorkModes
        : profile.desiredWorkModes
        ? [profile.desiredWorkModes]
        : [];
      setWorkplace({
        onSite: modes.includes("På plats"),
        hybrid: modes.includes("Hybrid"),
        remote: modes.includes("Distans"),
      });
    }).catch(() => {
      // Leave defaults if profile fetch fails
    });
  }, []);
  const navigate = useNavigate();

  // Compute desiredWorkModes string from UI state
  const currentDesiredWorkModes = (): string[] | undefined => {
    // UI is mutually exclusive; send single-element array
    if (workplace.onSite) return ["På plats"];
    if (workplace.hybrid) return ["Hybrid"];
    if (workplace.remote) return ["Distans"];
    return undefined;
  };

  // Send a full settings payload expected by backend (not partial)
  const saveSettings = async (overrides: Partial<{ searchable: boolean; travelAvailability: boolean; desiredWorkModes: string[] }>) => {
    const payload = {
      searchable,
      travelAvailability: willingToTravel,
      desiredWorkModes: currentDesiredWorkModes(),
      ...overrides,
    };
    // Only send if we have a desiredWorkModes value (backend may require it)
    if (!payload.desiredWorkModes || payload.desiredWorkModes.length === 0) {
      // default to "På plats" if none selected to satisfy validation
      payload.desiredWorkModes = ["På plats"];
    }
    await ApiService.updateUserSettings(payload);
  };

  // Format createdAt to a readable date (YYYY-MM-DD or localized)
  let registrationDate = tSync('profilePage_registration_unknown');
  if (createdAt && createdAt !== '0001-01-01 00:00:00') {
    const date = new Date(createdAt.replace(' ', 'T'));
    if (!isNaN(date.getTime())) {
      registrationDate = date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }
  return (
    <section className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-4 border border-slate-200 max-w-3xl mx-auto relative overflow-x-auto">
      {/* Top row: Avatar left, Info grid right, Cogwheel top right */}
      <div className="flex flex-row w-full gap-6 mb-2 items-start">
        {/* Avatar and registration */}
        <div className="flex flex-col items-center min-w-[96px]">
          <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-600 mb-2">
            {initials(name)}
          </div>
          <div className="text-xs text-slate-300 font-normal">{tSync('profilePage_registration_label')}: {registrationDate}</div>
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
              <div className="font-normal text-slate-700 text-sm">{tSync('settingsPage_name_label')}</div>
              <div className="font-bold text-lg text-slate-900">{name}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">{tSync('profilePage_title_label')}</div>
              <div className="font-bold text-lg text-slate-900">{title}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">{tSync('profilePage_employmentType_label')}</div>
              <div className="font-bold text-lg text-slate-900">{employmentType}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">{tSync('profilePage_registration_date_label')}</div>
              <div className="font-bold text-lg text-slate-900">{registrationDate}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">{tSync('settingsPage_phone_label')}</div>
              <div className="font-bold text-lg text-slate-900">{phone}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">{tSync('settingsPage_email_label')}</div>
              <div className="font-bold text-lg text-slate-900">{email}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">{tSync('profilePage_location_label')}</div>
              <div className="font-bold text-lg text-slate-900">{location}</div>
            </div>
            <div className="text-right">
              <div className="font-normal text-slate-700 text-sm">{tSync('profilePage_region_label')}</div>
              <div className="font-bold text-lg text-slate-900">{region}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Toggles and workplace switches in a single row, with label above checkboxes only */}
      <div className="flex flex-row items-end gap-6 mt-4 w-full">
        <ToggleSwitch
          checked={searchable}
          onChange={async () => {
            const newValue = !searchable;
            setSearchable(newValue);
            await saveSettings({ searchable: newValue });
          }}
          label={tSync('profilePage_searchable_label')}
          yesLabel={tSync('profilePage_yes_label')}
          noLabel={tSync('profilePage_no_label')}
        />
        <ToggleSwitch
          checked={willingToTravel}
          onChange={async () => {
            const newValue = !willingToTravel;
            setWillingToTravel(newValue);
            await saveSettings({ travelAvailability: newValue });
          }}
          label={tSync('profilePage_travel_label')}
          yesLabel={tSync('profilePage_yes_label')}
          noLabel={tSync('profilePage_no_label')}
        />
        <div className="relative flex flex-col items-center ml-8">
          <span className="text-xs text-slate-400 font-normal mb-1 text-center absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">{tSync('profilePage_workplace_label')}</span>
          <div className="flex flex-row items-end gap-2 min-h-[48px]">
            <OutlinedCheckbox
              label={tSync('profilePage_workplace_onsite_label')}
              checked={workplace.onSite}
              onChange={async () => {
                setWorkplace({ onSite: true, hybrid: false, remote: false });
                await saveSettings({ desiredWorkModes: ["På plats"] });
              }}
              stacked={false}
            />
            <OutlinedCheckbox
              label={tSync('profilePage_workplace_hybrid_label')}
              checked={workplace.hybrid}
              onChange={async () => {
                setWorkplace({ onSite: false, hybrid: true, remote: false });
                await saveSettings({ desiredWorkModes: ["Hybrid"] });
              }}
              stacked={false}
            />
            <OutlinedCheckbox
              label={tSync('profilePage_workplace_remote_label')}
              checked={workplace.remote}
              onChange={async () => {
                setWorkplace({ onSite: false, hybrid: false, remote: true });
                await saveSettings({ desiredWorkModes: ["Distans"] });
              }}
              stacked={false}
            />
          </div>
        </div>
      </div>
      {/* Kompetenser */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-bold text-slate-700">{tSync('profilePage_competencies_label')}</div>
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
