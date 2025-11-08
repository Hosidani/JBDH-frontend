import React, { useEffect, useState } from 'react';

interface ProfileData {
  email: string;
  aboutMe?: string;
  // Add more fields as needed from your backend's view model
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
  const response = await fetch('http://localhost:5071/api/profile', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Något gick fel.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="card">Laddar profil...</div>;
  if (error) return <div className="card text-red-600">Fel: {error}</div>;
  if (!profile) return <div className="card">Ingen profil hittades.</div>;

  return (
    <div className="card max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Min Profil</h2>
      <div className="mb-4">
        <strong>Email:</strong> {profile.email}
      </div>
      <div className="mb-4">
        <strong>Om mig:</strong>
        <div className="mt-1 bg-slate-100 rounded p-2 min-h-[40px]">{profile.aboutMe || <span className="text-slate-400">Ingen info</span>}</div>
      </div>
      {/* Add more profile fields and edit forms as needed */}
    </div>
  );
};

export default ProfilePage;
