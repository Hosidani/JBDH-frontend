import React, { useState } from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService } from '../../services/ApiService';
import { Toggle } from '../ui/Toggle';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import { InfoRow } from '../common/InfoRow';

interface ProfileInfoCardProps {
  name: string;
  createdAt?: string;
  title: string;
  employmentTypes: string[];
  location: string;
  region: string;
  phone: string;
  email: string;
}

const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  name,
  createdAt,
  employmentTypes,
  location,
  region,
  phone,
  email,
}) => {
  const [searchable, setSearchable] = useState(false);
  const [willingToTravel, setWillingToTravel] = useState(false);
  const [workplace, setWorkplace] = useState({ onSite: false, hybrid: false, remote: false });
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>(employmentTypes);
  const [profileBase, setProfileBase] = useState<{ name: string; email: string; phone_number: string }>({ name: '', email: '', phone_number: '' });
  const { tSync } = useTranslation();

  React.useEffect(() => {
    ApiService.getMyProfile().then(profile => {
      setSearchable(!!profile.searchable);
      setWillingToTravel(!!profile.travelAvailability);
      setProfileBase({ name: profile.name || '', email: profile.email || '', phone_number: profile.phoneNumber || '' });
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
    const modes: string[] = [];
    if (workplace.onSite) modes.push('På plats');
    if (workplace.hybrid) modes.push('Hybrid');
    if (workplace.remote) modes.push('Distans');
    return modes;
  };

  const saveSettings = async (overrides: Partial<{ searchable: boolean; travelAvailability: boolean; desiredWorkModes: string[]; desiredEmploymentTypes: string[] }>) => {
    const payload = {
      ...profileBase,
      searchable,
      travelAvailability: willingToTravel,
      desiredWorkModes: currentDesiredWorkModes(),
      ...overrides,
    };
    await ApiService.updateUserSettings(payload);
  };

  let registrationDate = tSync('profilePage_registration_unknown');
  if (createdAt && createdAt !== '0001-01-01 00:00:00') {
    const date = new Date(createdAt.replace(' ', 'T'));
    if (!isNaN(date.getTime())) {
      registrationDate = date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }

  const workplaceSelectedArr = [
    ...(workplace.onSite ? ['onSite'] : []),
    ...(workplace.hybrid ? ['hybrid'] : []),
    ...(workplace.remote ? ['remote'] : []),
  ];
  const workplaceOptions = [
    { value: 'onSite', label: tSync('profilePage_workplace_onsite_label') },
    { value: 'hybrid', label: tSync('profilePage_workplace_hybrid_label') },
    { value: 'remote', label: tSync('profilePage_workplace_remote_label') },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-600 mb-2">
          {initials(name)}
        </div>
        <div className="text-xs text-slate-400">{tSync('profilePage_registration_label')}: {registrationDate}</div>
      </div>

{/* Two-column layout */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Column 1: Namn, Anst.form, Telefon, Ort + Sökbar + Resbar */}
        <div className="flex-1 flex flex-col gap-4">
          <InfoRow label={tSync('settingsPage_name_label')}          value={name} />
          <InfoRow label={tSync('settingsPage_phone_label')}         value={phone} />
          <InfoRow label={tSync('profilePage_location_label')}       value={location} />
          <div className="flex flex-row gap-6">
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
          </div>
        </div>

        {/* Rad 2: E-post + Telefon */}
        <InfoRow label={tSync('settingsPage_email_label')} value={email} type="email" />
        <InfoRow label={tSync('settingsPage_phone_label')} value={phone} />

        {/* Rad 3: Önskad Ort + Område */}
        <InfoRow label={tSync('profilePage_location_label')} value={location} />
        <InfoRow label={tSync('profilePage_region_label')}   value={region} />

        {/* Rad 4: Önskad arbetsplats + Önskad anställningsform */}
        <CheckboxGroup
          label={tSync('profilePage_workplace_label')}
          options={workplaceOptions}
          selected={workplaceSelectedArr}
          onChange={async (vals) => {
            const next = { onSite: vals.includes('onSite'), hybrid: vals.includes('hybrid'), remote: vals.includes('remote') };
            setWorkplace(next);
            const modes: string[] = [];
            if (next.onSite) modes.push('På plats');
            if (next.hybrid) modes.push('Hybrid');
            if (next.remote) modes.push('Distans');
            await saveSettings({ desiredWorkModes: modes });
          }}
          layout="row"
        />
        <CheckboxGroup
          label={tSync('profilePage_employmentType_label')}
          options={[
            { value: 'fulltime',   label: tSync('employmentType_fulltime') },
            { value: 'parttime',   label: tSync('employmentType_parttime') },
            { value: 'hours',      label: tSync('employmentType_hours') },
            { value: 'project',    label: tSync('employmentType_project') },
            { value: 'consulting', label: tSync('employmentType_consulting') },
          ]}
          selected={selectedEmploymentTypes}
          onChange={async (vals) => {
            setSelectedEmploymentTypes(vals);
            await saveSettings({ desiredEmploymentTypes: vals });
          }}
          layout="row"
        />

        {/* Rad 5: Tillgänglig från + Sökbar & Resbar */}
        <InfoRow label={tSync('profilePage_registration_date_label')} value={registrationDate} />
        <div className="flex flex-row gap-6">
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
        </div>
      </div>

    </div>
  );
};

export default ProfileInfoCard;
