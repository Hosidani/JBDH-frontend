import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/ApiService';
import { ProfileInfoCard, AIAnalysisCard, FileDropZoneCard, ButtonsCard } from '../../components/profile';
import { PageWrapper, PageBackground } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useAIResponsePolling } from '../../hooks/useAIResponsePolling';


function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { tSync, language, ready } = useTranslation();
  const { polling, setPolling, getLatestAIResponseId, pollForLatestAIResponse } = useAIResponsePolling();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ApiService.getMyProfile();
        // Om response är ett objekt med id, email etc, sätt det direkt
        if (response && response.id) {
          setProfile(response);
        } else {
          setError('Något gick fel (1).');
          setProfile(null);
        }
      } catch (err) {
        setError((err as any)?.message || 'Något gick fel (2).');
        setAnalysisResult(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCVUpload = async (file: File) => {
    setAnalysisResult(null);
    try {
      const initialLatestId = getLatestAIResponseId(profile?.aiResponses);
      await ApiService.uploadCVForAnalysis(file, language);
      setPolling(true);
      pollForLatestAIResponse(initialLatestId, setProfile);
    } catch (err: any) {
      setPolling(false);
    }
  };

  if (!ready) return <div className="card">{tSync('profilePage_loading_language')}</div>;
  if (loading) return <div className="card">{tSync('profilePage_loading_profile')}</div>;
  if (error) return <div className="card text-red-600">{tSync('profilePage_error_prefix')}{error}</div>;
  if (!profile) return <div className="card">{tSync('profilePage_no_profile_found')}</div>;

  const profileData = profile;

  // Lägg till denna rad för felsökning:
  alert('profileData.location: ' + profileData.location);

  const profileCardProps = {
    name: profileData.name || tSync('profilePage_name_missing'),
    createdAt: profileData.created_at,
    title: Array.isArray(profileData.desired_employment_types) && profileData.desired_employment_types.length > 0 ? profileData.desired_employment_types[0] : tSync('profilePage_default_title'),
    employmentType: Array.isArray(profileData.desired_employment_types) ? profileData.desired_employment_types.join(', ') : tSync('profilePage_default_employmentType'),
    location: profileData.location || tSync('profilePage_default_location'),
    region: profileData.desired_city || tSync('profilePage_default_region'),
    phone: profileData.phone_number || tSync('profilePage_default_phone'),
    email: profileData.email,
    tags:
      analysisResult && (analysisResult.hardSkills || analysisResult.softSkills)
        ? [
            ...(analysisResult.hardSkills || []),
            ...(analysisResult.softSkills || [])
          ]
        : profileData.competencies || [],
    aboutMe: profileData.about_me,
    owner: profileData.owner,
    ownedUsers: profileData.owned_users,
    selectedRoles: profileData.selected_roles,
    developerMode: profileData.developer_mode,
    searchable: profileData.searchable,
    isBanned: profileData.is_banned,
    role: profileData.role,
    cvPath: profileData.cv_path,
    workPlace: profileData.work_place,
    travelAvailability: profileData.travel_availability,
    availableFrom: profileData.available_from,
    aiResponses: profileData.ai_responses,
    ownerId: profileData.owner_id,
    id: profileData.id,
    // Lägg till fler fält om du vill visa dem
  };

  let latestAIResponse: any = null;
  let latestAIAnalysis: any = null;
  let aiResponses: any[] = [];
  if (profileData && Array.isArray(profileData.aiResponses) && profileData.aiResponses.length > 0) {
    aiResponses = profileData.aiResponses;
    latestAIResponse = aiResponses[0];
    latestAIAnalysis = latestAIResponse?.analysis || null;
  }

  return (
    <>
      <PageBackground imageUrl="/edit_profile.png" opacity={1} blur={0} />
      <PageWrapper>
        <div className="relative z-10 max-w-2xl w-full mx-auto mt-8 flex flex-col gap-8">
          <ProfileInfoCard {...profileCardProps} />
          <AIAnalysisCard
            polling={polling}
            analysis={latestAIAnalysis}
            aiResponse={latestAIResponse}
            aiResponses={aiResponses}
            tSync={tSync}
            language={language}
          />
          <FileDropZoneCard tSync={tSync} handleCVUpload={handleCVUpload} />
          <ButtonsCard 
            tSync={tSync}
            onMatchNowClick={() => navigate('/matching')}
            onManualSearchClick={() => navigate('/search')}
          />
        </div>
      </PageWrapper>
    </>
  );
}

export default ProfilePage;