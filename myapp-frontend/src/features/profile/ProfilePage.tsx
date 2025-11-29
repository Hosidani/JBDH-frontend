import { useState, useEffect } from 'react';
import { ApiService } from '../../services/ApiService';
import ProfileInfoCard from '../../components/ProfileInfoCard';
import PageWrapper from '../../components/PageWrapper';
import PageBackground from '../../components/PageBackground';
import AIAnalysisCard from '../../components/profile/AIAnalysisCard';
import FileDropZoneCard from '../../components/profile/FileDropZoneCard';
import ButtonsCard from '../../components/profile/ButtonsCard';
import { useTranslation } from '../../hooks/TranslationProvider';

const API_URL = import.meta.env.VITE_API_URL;

function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [polling, setPolling] = useState(false);
  const { tSync, ready } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/profile`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);

        let aiAnalysis = null;
        try {
          const aiResponse = await ApiService.getLatestAIUserResponse();
          if (aiResponse) {
            if (aiResponse.analysis) {
              aiAnalysis = aiResponse.analysis;
            } else if (aiResponse.analysisResult) {
              aiAnalysis = aiResponse.analysisResult;
            } else if (aiResponse.responseText) {
              try {
                aiAnalysis = JSON.parse(aiResponse.responseText);
                if (typeof aiAnalysis === 'string') {
                  try { aiAnalysis = JSON.parse(aiAnalysis); } catch { aiAnalysis = null; }
                }
              } catch { aiAnalysis = null; }
            }
          }
        } catch { aiAnalysis = null; }
        setAnalysisResult(aiAnalysis);
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

  // Handle CV upload
  const handleCVUpload = async (file: File) => {
    setAnalysisResult(null);
    try {
      await ApiService.uploadCVForAnalysis(file);
      setPolling(true);
    } catch (err: any) {
    }
  };

  if (!ready) return <div className="card">{tSync('profilePage_loading_language')}</div>;
  if (loading) return <div className="card">{tSync('profilePage_loading_profile')}</div>;
  if (error) return <div className="card text-red-600">{tSync('profilePage_error_prefix')}{error}</div>;
  if (!profile) return <div className="card">{tSync('profilePage_no_profile_found')}</div>;

  if (!profile.user) {
    return (
      <div className="card text-yellow-700 bg-yellow-50 border border-yellow-200">
        {tSync('profilePage_no_user_info')}
      </div>
    );
  }

  const user = profile.user;

  let safeAnalysis = analysisResult;

  return (
    <>
      <PageBackground imageUrl="/edit_profile.png" />
      <PageWrapper>
        <div className="relative z-10 max-w-2xl w-full mx-auto mt-8 flex flex-col gap-8">
          <ProfileInfoCard
            name={user.name || tSync('profilePage_name_missing')}
            registrationDate={user.registrationDate || '2025-12-24'}
            title={user.title || tSync('profilePage_default_title')}
            employmentType={user.employmentType || tSync('profilePage_default_employmentType')}
            location={user.location || tSync('profilePage_default_location')}
            region={user.region || tSync('profilePage_default_region')}
            phone={user.phone || tSync('profilePage_default_phone')}
            email={user.email}
            tags={
              safeAnalysis && (safeAnalysis.hardSkills || safeAnalysis.softSkills)
                ? [
                    ...(safeAnalysis.hardSkills || []),
                    ...(safeAnalysis.softSkills || [])
                  ]
                : user.tags || [
                    tSync('profilePage_tag_reactNative'),
                    tSync('profilePage_tag_angular'),
                    tSync('profilePage_tag_php'),
                    tSync('profilePage_tag_csharp'),
                    tSync('profilePage_tag_typescript'),
                    tSync('profilePage_tag_ux'),
                    tSync('profilePage_tag_java'),
                    tSync('profilePage_tag_aiPrompting')
                  ]
            }
          />
          <AIAnalysisCard polling={polling} analysis={safeAnalysis} tSync={tSync} />
          <FileDropZoneCard tSync={tSync} handleCVUpload={handleCVUpload} />
          <ButtonsCard tSync={tSync} />
        </div>
      </PageWrapper>
    </>
  );
}

export default ProfilePage;

