import React, { useState } from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService } from '../../services/ApiService';
import { Toggle } from '../ui/Toggle';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import { InfoRow } from '../common/InfoRow';
import { Badge } from '../ui/Badge';

interface ProfileInfoCardProps {
  name: string;
  createdAt?: string;
  title: string;
  employmentTypes: string[];
  location: string;
  region: string;
  phone: string;
  email: string;
  tags: string[];
}

const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  name: nameProp,
  createdAt,
  title: titleProp,
  employmentTypes,
  location: locationProp,
  region: regionProp,
  phone: phoneProp,
  email: emailProp,
  tags,
}) => {
  const [name, setName] = useState(nameProp);
  const [email, setEmail] = useState(emailProp);
  const [phone, setPhone] = useState(phoneProp);
  const [title, setTitle] = useState(titleProp);
  const [location, setLocation] = useState(locationProp);
  const [region, setRegion] = useState(regionProp);
  const [searchable, setSearchable] = useState(false);
  const [willingToTravel, setWillingToTravel] = useState(false);
  const [workplace, setWorkplace] = useState({ onSite: false, hybrid: false, remote: false });
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>(employmentTypes);
  const { tSync } = useTranslation();

  React.useEffect(() => {
    ApiService.getMyProfile().then(profile => {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phoneNumber || '');
      setTitle(profile.desiredEmploymentType || '');
      setLocation(profile.location || '');
      setRegion(profile.desiredCity || '');
      setSearchable(!!profile.searchable);
      setWillingToTravel(!!profile.travelAvailability);
      setSelectedEmploymentTypes(Array.isArray(profile.desiredEmploymentTypes) ? profile.desiredEmploymentTypes : []);
      const modes: string[] = Array.isArray(profile.desiredWorkModes)
        ? profile.desiredWorkModes
        : profile.desiredWorkModes ? [profile.desiredWorkModes] : [];
      setWorkplace({ onSite: modes.includes('På plats'), hybrid: modes.includes('Hybrid'), remote: modes.includes('Distans') });
    }).catch(() => {});
  }, []);

  const currentDesiredWorkModes = (): string[] => {
    const modes: string[] = [];
    if (workplace.onSite) modes.push('På plats');
    if (workplace.hybrid) modes.push('Hybrid');
    if (workplace.remote) modes.push('Distans');
    return modes;
  };

  const saveSettings = async (overrides: Record<string, any> = {}) => {
    const payload = {
      name,
      email,
      phone_number: phone,
      location,
      desiredCity: region,
      desiredEmploymentType: title,
      searchable,
      travelAvailability: willingToTravel,
      desiredWorkModes: currentDesiredWorkModes(),
      desiredEmploymentTypes: selectedEmploymentTypes,
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

  const hard = tags.filter(tag => !/team|communication|leadership|collaboration|coaching|mentoring|conflict|process|planning|problem|stakeholder|cross/i.test(tag));
  const soft = tags.filter(tag => /team|communication|leadership|collaboration|coaching|mentoring|conflict|process|planning|problem|stakeholder|cross/i.test(tag));
  const maxLen = Math.max(hard.length, soft.length);
  const interleaved: { value: string; type: 'hard' | 'soft' }[] = [];
  for (let i = 0; i < maxLen; i++) {
    if (i < hard.length) interleaved.push({ value: hard[i], type: 'hard' });
    if (i < soft.length) interleaved.push({ value: soft[i], type: 'soft' });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-600 mb-2">
          {initials(name || ' ')}
        </div>
        <div className="text-xs text-slate-400">{tSync('profilePage_registration_label')}: {registrationDate}</div>
      </div>

      {/* 5-row × 2-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Row 1: Name | Title */}
        <InfoRow
          label={tSync('settingsPage_name_label')}
          value={name}
          readOnly={false}
          onChange={setName}
          onBlur={() => saveSettings()}
        />
        <InfoRow
          label={tSync('profilePage_title_label')}
          value={title}
          readOnly={false}
          onChange={setTitle}
          onBlur={() => saveSettings()}
        />

        {/* Row 2: Email | Phone */}
        <InfoRow
          label={tSync('settingsPage_email_label')}
          value={email}
          type="email"
          readOnly={false}
          onChange={setEmail}
          onBlur={() => saveSettings()}
        />
        <InfoRow
          label={tSync('settingsPage_phone_label')}
          value={phone}
          type="tel"
          readOnly={false}
          onChange={setPhone}
          onBlur={() => saveSettings()}
        />

        {/* Row 3: Location | Region */}
        <InfoRow
          label={tSync('profilePage_location_label')}
          value={location}
          readOnly={false}
          onChange={setLocation}
          onBlur={() => saveSettings()}
        />
        <InfoRow
          label={tSync('profilePage_region_label')}
          value={region}
          readOnly={false}
          onChange={setRegion}
          onBlur={() => saveSettings()}
        />

        {/* Row 4: Workplace | Employment type */}
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

        {/* Row 5: Registration date | Searchable + Travel */}
        <InfoRow
          label={tSync('profilePage_registration_date_label')}
          value={registrationDate}
        />
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

      {/* Competencies */}
      <div>
        <span className="font-bold text-slate-700 text-sm">{tSync('profilePage_competencies_label')}</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {interleaved.map((tag, idx) => (
            <Badge
              key={tag.value + idx}
              label={tag.value}
              color={tag.type === 'hard' ? 'blue' : 'green'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoCard;
