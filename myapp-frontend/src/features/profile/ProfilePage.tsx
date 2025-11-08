
import React, { useEffect, useState } from 'react';
import ProfileInfoCard from '../../components/ProfileInfoCard';
import FileDropZone from '../../components/FileDropZone';
import SavedJobCard from '../../components/SavedJobCard';

// Match backend ProfileViewModel
export interface ProfileData {
  user: {
    id: number;
    name: string;
    registrationDate: string;
    title: string;
    employmentType: string;
    location: string;
    region: string;
    phone: string;
    email: string;
    tags: string[];
    aboutMe?: string;
    // Add more fields as needed
  };
  isFriend: boolean;
  organisation?: {
    id: number;
    name: string;
    // ...other org fields
  };
  userAIResponse?: any;
  cvAnalysisResult?: any;
  friends: Array<any>;
  pendingFriendRequests: Array<any>;
  jobApplications: Array<{
    applicationId: number;
    jobId: number;
    jobTitle: string;
    jobUrl: string;
    jobDescription: string;
    notes?: string;
    appliedAt: string;
  }>;
  courseProposals?: any;
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

  const user = profile.user;

  return (
    <div className="max-w-2xl mx-auto mt-8 flex flex-col gap-8">
      <ProfileInfoCard
        name={user.name || 'Namn Saknas'}
        registrationDate={user.registrationDate || '2025-12-24'}
        title={user.title || 'Utvecklare'}
        employmentType={user.employmentType || 'Heltid/Distans'}
        location={user.location || 'Göteborg'}
        region={user.region || 'Göta - Resbar'}
        phone={user.phone || '0709 95 37 36'}
        email={user.email}
        tags={user.tags || ['React Native', 'Angular', 'PHP', 'C#', 'Typescript', 'UX', 'Java', 'AI Prompting']}
      />
      {/* Upload zones */}
      <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
        <FileDropZone
          label="Dra och släpp din CV här"
          description="PDF:er som laddas upp visas ej på din listan med sparade dokument. Endast du och ditt meddelande får tillgång till filen. Du kan även klicka för att välja en PDF."
          accept=".pdf"
          onFileSelected={file => { /* handle CV upload */ }}
        />
        <FileDropZone
          label="Dra och släpp ditt personliga brev här"
          description="PDF:er som laddas upp visas ej på din listan med sparade dokument. Endast du och ditt meddelande får tillgång till filen. Du kan även klicka för att välja en PDF."
          accept=".pdf"
          onFileSelected={file => { /* handle cover letter upload */ }}
        />
      </div>
      {/* Action buttons */}
      <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
        <button className="bg-blue-600 text-white px-8 py-3 rounded font-semibold text-lg shadow hover:bg-blue-700 transition">Matcha nu</button>
        <button className="bg-white border border-blue-600 text-blue-700 px-8 py-3 rounded font-semibold text-lg shadow hover:bg-blue-50 transition">Sök jobb manuellt</button>
      </div>
      {/* Saved jobs section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Dina sparade annonser</h3>
        {profile.jobApplications.length === 0 ? (
          <div className="text-slate-500 text-sm">Du har inga sparade jobbannonser ännu.</div>
        ) : (
          profile.jobApplications.map(app => (
            <SavedJobCard
              key={app.applicationId}
              jobTitle={app.jobTitle}
              company={app.jobDescription.split('|')[0] || ''}
              location={app.jobDescription.split('|')[1] || ''}
              tags={['IT', 'Stockholm']} // Replace with real tags if available
              status={"Sökt"}
              appliedAt={app.appliedAt?.split('T')[0] || ''}
              expiresAt={"2025-12-23"} // Replace with real expiry if available
              jobUrl={app.jobUrl}
              notes={app.notes}
              actionItem={false}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
