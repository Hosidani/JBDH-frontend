import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/ApiService';
import ProfileInfoCard from '../../components/ProfileInfoCard';
import PageWrapper from '../../components/PageWrapper';
import PageBackground from '../../components/PageBackground';
import AIAnalysisCard from '../../components/profile/AIAnalysisCard';
import FileDropZoneCard from '../../components/profile/FileDropZoneCard';
import ButtonsCard from '../../components/profile/ButtonsCard';
import { useTranslation } from '../../hooks/TranslationProvider';


function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [polling, setPolling] = useState(false);
  const { tSync, ready } = useTranslation();

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
        // Only use getMyProfile for all profile and AI response data
        const data = await ApiService.getMyProfile();
        setProfile(data);
        // If you need to extract AI analysis, do it from data.aiResponses in render
      } catch (err) {
        setError((err as any)?.message || 'Något gick fel.');
        setAnalysisResult(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);
  /*
  // Example: Update user settings (stub, connect to your form/UI as needed)
  const handleUpdateUserSettings = async (updatedDto: any) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await ApiService.updateUserSettings(updatedDto);
      setProfile(updatedProfile);
    } catch (err: any) {
      setError(err.message || 'Kunde inte uppdatera inställningar.');
    } finally {
      setLoading(false);
    }
  };

  // Example: Delete user (stub, connect to your UI as needed)
  const handleDeleteMyUser = async () => {
    setLoading(true);
    setError(null);
    try {
      await ApiService.deleteMyUser();
      setProfile(null);
    } catch (err: any) {
      setError(err.message || 'Kunde inte radera användare.');
    } finally {
      setLoading(false);
    }
  };
  */

  // Handle CV upload
  // Poll for latest AI response after CV upload
  // Helper to get latest AI response id or timestamp
  const getLatestAIResponseId = (aiResponses: any[]) => {
    if (!Array.isArray(aiResponses) || aiResponses.length === 0) return null;
    const latest = aiResponses.reduce((latest: any, curr: any) => {
      if (!latest) return curr;
      const latestDate = new Date(latest.createdAt || latest.CreatedAt || 0);
      const currDate = new Date(curr.createdAt || curr.CreatedAt || 0);
      return currDate > latestDate ? curr : latest;
    }, null);
    return latest?.id || latest?.ID || latest?.createdAt || latest?.CreatedAt || null;
  };

  const pollForLatestAIResponse = async (initialLatestId: any) => {
    let attempts = 0;
    const maxAttempts = 30; // e.g. poll for up to 60 seconds
    while (attempts < maxAttempts) {
      try {
        const data = await ApiService.getMyProfile();
        setProfile(data);
        const newLatestId = getLatestAIResponseId(data.aiResponses);
        if (newLatestId && newLatestId !== initialLatestId) {
          // New AI response detected
          setPolling(false);
          return;
        }
      } catch {}
      await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds
      attempts++;
    }
    setPolling(false);
  };

  const handleCVUpload = async (file: File) => {
    setAnalysisResult(null);
    try {
      // Get initial latest AI response id before upload
      const initialLatestId = getLatestAIResponseId(profile?.aiResponses);
      await ApiService.uploadCVForAnalysis(file);
      setPolling(true);
      pollForLatestAIResponse(initialLatestId);
    } catch (err: any) {
      setPolling(false);
    }
  };

  if (!ready) return <div className="card">{tSync('profilePage_loading_language')}</div>;
  if (loading) return <div className="card">{tSync('profilePage_loading_profile')}</div>;
  if (error) return <div className="card text-red-600">{tSync('profilePage_error_prefix')}{error}</div>;
  if (!profile) return <div className="card">{tSync('profilePage_no_profile_found')}</div>;

  // Unpack user data from backend response
  const profileData = profile;

  // Map fields for ProfileInfoCard
  const profileCardProps = {
    name: profileData.name || tSync('profilePage_name_missing'),
    registrationDate: profileData.registrationDate || '2025-12-24',
    title: profileData.desiredEmploymentType || tSync('profilePage_default_title'),
    employmentType: profileData.desiredEmploymentType || tSync('profilePage_default_employmentType'),
    location: profileData.location || tSync('profilePage_default_location'),
    region: profileData.desiredCity || tSync('profilePage_default_region'),
    phone: profileData.phoneNumber || tSync('profilePage_default_phone'),
    email: profileData.email,
    tags:
      analysisResult && (analysisResult.hardSkills || analysisResult.softSkills)
        ? [
            ...(analysisResult.hardSkills || []),
            ...(analysisResult.softSkills || [])
          ]
        : profileData.competencies || [
            tSync('profilePage_tag_reactNative'),
            tSync('profilePage_tag_angular'),
            tSync('profilePage_tag_php'),
            tSync('profilePage_tag_csharp'),
            tSync('profilePage_tag_typescript'),
            tSync('profilePage_tag_ux'),
            tSync('profilePage_tag_java'),
            tSync('profilePage_tag_aiPrompting')
          ]
  };

  // Use aiResponses[0] as the latest response (list is sorted)
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
          {/* Always render AIAnalysisCard, let it handle polling/animation and analysis/history display */}
          <AIAnalysisCard
            polling={polling}
            analysis={latestAIAnalysis}
            aiResponse={latestAIResponse}
            aiResponses={aiResponses}
            tSync={tSync}
          />
          <FileDropZoneCard tSync={tSync} handleCVUpload={handleCVUpload} />
          <ButtonsCard 
            tSync={tSync} 
            onManualSearchClick={() => navigate('/search')}
          />
        </div>
      </PageWrapper>
    </>
  );
}

export default ProfilePage;