import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/ApiService';
import { ProfileInfoCard, AIAnalysisCard, FileDropZoneCard, ButtonsCard } from '../../components/profile';
import { PageWrapper, PageBackground } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { SectionCard } from '../../components/common/SectionCard';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useAIResponsePolling } from '../../hooks/useAIResponsePolling';


function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCVUpload = async (file: File) => {
    setPolling(true);
    try {
      const initialLatestId = getLatestAIResponseId(profile?.aiResponses);
      await ApiService.uploadCVForAnalysis(file, language);
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
    employmentTypes: Array.isArray(profileData.desiredEmploymentTypes) ? profileData.desiredEmploymentTypes : [],
    location: profileData.location || tSync('profilePage_default_location'),
    region: profileData.desiredCity || tSync('profilePage_default_region'),
    phone: profileData.phoneNumber || tSync('profilePage_default_phone'),
    email: profileData.email,
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
      <PageWrapper className="relative z-10">
        <div className="flex flex-col gap-6">
          <PageCard title={tSync('profilePage_title')}>
            <p className="mb-6 text-sm text-slate-600">{tSync('profilePage_description')}</p>
            <ProfileInfoCard {...profileCardProps} />
          </PageCard>

          <PageCard title={tSync('profilePage_ai_analysis_title')}>
            <AIAnalysisCard
              polling={polling}
              analysis={latestAIAnalysis}
              aiResponse={latestAIResponse}
              aiResponses={aiResponses}
              tSync={tSync}
              language={language}
            />
            <div className="mt-6">
              <FileDropZoneCard tSync={tSync} handleCVUpload={handleCVUpload} processing={polling} />
            </div>
          </PageCard>

          <SectionCard>
            <ButtonsCard
              tSync={tSync}
              onMatchNowClick={() => navigate('/matching')}
              onManualSearchClick={() => navigate('/search')}
            />
          </SectionCard>
        </div>
      </PageWrapper>
    </>
  );
}

export default ProfilePage;