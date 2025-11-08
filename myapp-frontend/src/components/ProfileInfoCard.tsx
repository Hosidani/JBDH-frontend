import React from 'react';

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
}) => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
    {/* Avatar */}
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-600 mb-2">
        {initials(name)}
      </div>
      <div className="text-xs text-slate-400">Registrerad: {registrationDate}</div>
    </div>
    {/* Info */}
    <div className="flex-1 w-full">
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
        <div className="font-bold text-xl text-slate-800">{name}</div>
        <div className="text-slate-500 ml-0 md:ml-4">{title}</div>
      </div>
      <div className="flex flex-wrap gap-4 text-slate-600 mb-2">
        <span>{employmentType}</span>
        <span>{location}</span>
        <span>{region}</span>
      </div>
      <div className="flex flex-wrap gap-4 text-slate-600 mb-2">
        <span>{phone}</span>
        <span>{email}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map(tag => (
          <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

export default ProfileInfoCard;
