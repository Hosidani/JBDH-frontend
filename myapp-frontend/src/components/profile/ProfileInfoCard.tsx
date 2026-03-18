import React, { useState } from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService } from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';
import IconSettings from '../icon_library/IconSettings';
import IconEditPen from '../icon_library/IconEditPen';
import { Toggle } from '../ui/Toggle';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import { InfoRow } from '../common/InfoRow';
import { Badge } from '../ui/Badge';
import { SectionCard } from '../common/SectionCard';

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
  const navigate = useNavigate();

  React.useEffect(() => {
    ApiService.getMyProfile().then(profile => {
      setSearchable(!!profile.searchable);
      setWillingToTravel(!!profile.travelAvailability);
      const modes: string[] = Array.isArray(profile.desiredWorkModes)
        ? profile.desiredWorkModes
        : profile.desiredWorkModes
        ? [profile.desiredWorkModes]
        : [];
      setWorkplace({
        onSite: modes.includes('På plats'),
        hybrid: modes.includes('Hybrid'),
        remote: modes.includes('Distans'),
      });
    }).catch(() => {});
  }, []);

  const currentDesiredWorkModes = (): string[] => {
<<<<<<< HEAD
    if (workplace.onSite) return ['På plats'];
    if (workplace.hybrid) return ['Hybrid'];
    if (workplace.remote) return ['Distans'];
    return ['På plats'];
=======
    const modes: string[] = [];
    if (workplace.onSite) modes.push('På plats');
    if (workplace.hybrid) modes.push('Hybrid');
    if (workplace.remote) modes.push('Distans');
    return modes;
>>>>>>> 9a28654 (Fix multi checkbox)
  };

  const saveSettings = async (overrides: Partial<{ searchable: boolean; travelAvailability: boolean; desiredWorkModes: string[] }>) => {
    await ApiService.updateUserSettings({
      searchable,
      travelAvailability: willingToTravel,
      desiredWorkModes: currentDesiredWorkModes(),
      ...overrides,
<<<<<<< HEAD
    });
=======
    };
    await ApiService.updateUserSettings(payload);
>>>>>>> 9a28654 (Fix multi checkbox)
  };

  let registrationDate = tSync('profilePage_registration_unknown');
  if (createdAt && createdAt !== '0001-01-01 00:00:00') {
    const date = new Date(createdAt.replace(' ', 'T'));
    if (!isNaN(date.getTime())) {
      registrationDate = date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }

  const workplaceSelected = workplace.onSite ? 'onSite' : workplace.hybrid ? 'hybrid' : workplace.remote ? 'remote' : '';
  const workplaceOptions = [
    { value: 'onSite',  label: tSync('profilePage_workplace_onsite_label') },
    { value: 'hybrid',  label: tSync('profilePage_workplace_hybrid_label') },
    { value: 'remote',  label: tSync('profilePage_workplace_remote_label') },
  ];

  const hard = tags.filter(tag => !/team|communication|leadership|collaboration|coaching|mentoring|conflict|process|planning|problem|stakeholder|cross/i.test(tag));
  const soft = tags.filter(tag => /team|communication|leadership|collaboration|coaching|mentoring|conflict|process|planning|problem|stakeholder|cross/i.test(tag));
  const maxLen = Math.max(hard.length, soft.length);
  const interleaved: { value: string; type: 'hard' | 'soft' }[] = [];
  for (let i = 0; i < maxLen; i++) {
    if (i < hard.length) interleaved.push({ value: hard[i], type: 'hard' });
    if (i < soft.length) interleaved.push({ value: soft[i], type: 'soft' });
  }

  return (
    <SectionCard className="flex flex-col gap-6">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-600 mb-2">
          {initials(name)}
        </div>
        <div className="text-xs text-slate-400">{tSync('profilePage_registration_label')}: {registrationDate}</div>
      </div>

      {/* Settings gear */}
      <div className="flex justify-end -mt-4">
        <button
          type="button"
          aria-label="Inställningar"
          onClick={() => navigate('/settings')}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <IconSettings className="w-[22px] h-[22px] opacity-70 hover:opacity-100" />
        </button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoRow label={tSync('settingsPage_name_label')}              value={name} />
        <InfoRow label={tSync('profilePage_title_label')}              value={title} />
        <InfoRow label={tSync('profilePage_employmentType_label')}     value={employmentType} />
        <InfoRow label={tSync('profilePage_registration_date_label')}  value={registrationDate} />
        <InfoRow label={tSync('settingsPage_phone_label')}             value={phone} />
        <InfoRow label={tSync('settingsPage_email_label')}             value={email} type="email" />
        <InfoRow label={tSync('profilePage_location_label')}           value={location} />
        <InfoRow label={tSync('profilePage_region_label')}             value={region} />
      </div>

      {/* Toggles + workplace */}
      <div className="flex flex-row flex-wrap items-end gap-6">
        <Toggle
          label={tSync('profilePage_searchable_label')}
          checked={searchable}
          yesLabel={tSync('profilePage_yes_label')}
          noLabel={tSync('profilePage_no_label')}
          onChange={async () => {
            const v = !searchable;
            setSearchable(v);
            await saveSettings({ searchable: v });
          }}
        />
        <Toggle
          label={tSync('profilePage_travel_label')}
          checked={willingToTravel}
          yesLabel={tSync('profilePage_yes_label')}
          noLabel={tSync('profilePage_no_label')}
          onChange={async () => {
            const v = !willingToTravel;
            setWillingToTravel(v);
            await saveSettings({ travelAvailability: v });
          }}
        />
        <CheckboxGroup
          label={tSync('profilePage_workplace_label')}
          options={workplaceOptions}
          selected={workplaceSelected ? [workplaceSelected] : []}
          onChange={async ([val]) => {
            const next = { onSite: val === 'onSite', hybrid: val === 'hybrid', remote: val === 'remote' };
            setWorkplace(next);
            await saveSettings({ desiredWorkModes: next.onSite ? ['På plats'] : next.hybrid ? ['Hybrid'] : ['Distans'] });
          }}
          layout="row"
        />
<<<<<<< HEAD
=======
        <div className="relative flex flex-col items-center ml-8">
          <span className="text-xs text-slate-400 font-normal mb-1 text-center absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">{tSync('profilePage_workplace_label')}</span>
          <div className="flex flex-row items-end gap-2 min-h-[48px]">
            <OutlinedCheckbox
              label={tSync('profilePage_workplace_onsite_label')}
              checked={workplace.onSite}
              onChange={async () => {
                const next = { ...workplace, onSite: !workplace.onSite };
                setWorkplace(next);
                const modes: string[] = [];
                if (next.onSite) modes.push('På plats');
                if (next.hybrid) modes.push('Hybrid');
                if (next.remote) modes.push('Distans');
                await saveSettings({ desiredWorkModes: modes });
              }}
              stacked={false}
            />
            <OutlinedCheckbox
              label={tSync('profilePage_workplace_hybrid_label')}
              checked={workplace.hybrid}
              onChange={async () => {
                const next = { ...workplace, hybrid: !workplace.hybrid };
                setWorkplace(next);
                const modes: string[] = [];
                if (next.onSite) modes.push('På plats');
                if (next.hybrid) modes.push('Hybrid');
                if (next.remote) modes.push('Distans');
                await saveSettings({ desiredWorkModes: modes });
              }}
              stacked={false}
            />
            <OutlinedCheckbox
              label={tSync('profilePage_workplace_remote_label')}
              checked={workplace.remote}
              onChange={async () => {
                const next = { ...workplace, remote: !workplace.remote };
                setWorkplace(next);
                const modes: string[] = [];
                if (next.onSite) modes.push('På plats');
                if (next.hybrid) modes.push('Hybrid');
                if (next.remote) modes.push('Distans');
                await saveSettings({ desiredWorkModes: modes });
              }}
              stacked={false}
            />
          </div>
        </div>
>>>>>>> 9a28654 (Fix multi checkbox)
      </div>

      {/* Kompetenser */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-slate-700 text-sm">{tSync('profilePage_competencies_label')}</span>
          <IconEditPen className="opacity-60" />
        </div>
        <div className="flex flex-wrap gap-2">
          {interleaved.map((tag, idx) => (
            <Badge
              key={tag.value + idx}
              label={tag.value}
              color={tag.type === 'hard' ? 'blue' : 'green'}
            />
          ))}
        </div>
      </div>
    </SectionCard>
  );
};

export default ProfileInfoCard;
