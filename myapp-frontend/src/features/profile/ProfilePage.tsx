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
      window.dispatchEvent(new CustomEvent('requireLogin'));
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ApiService.getMyProfile();
        setProfile(data);
      } catch (err) {
        const msg = (err as any)?.message || '';
        if (msg.includes('401')) return;
        setError(msg || 'Något gick fel.');
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

  const profileCardProps = {
    name: profileData.name || tSync('profilePage_name_missing'),
    createdAt: profileData.createdAt,
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
      <PageWrapper className="relative z-10 flex flex-col gap-8">
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
      </PageWrapper>
    </>
  );
}

export default ProfilePage;