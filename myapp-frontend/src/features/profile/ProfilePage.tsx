import { useState, useEffect } from 'react';
import { ApiService } from '../../services/ApiService';
import ProfileInfoCard from '../../components/ProfileInfoCard';
import PageWrapper from '../../components/PageWrapper';
import PageBackground from '../../components/PageBackground';
import AIAnalysisCard from '../../components/profile/AIAnalysisCard';
import FileDropZoneCard from '../../components/profile/FileDropZoneCard';
import ButtonsCard from '../../components/profile/ButtonsCard';
import { useTranslation } from '../../hooks/TranslationProvider';


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

  // Unpack user data from backend response
  const user = profile;

  // Map fields for ProfileInfoCard
  const profileCardProps = {
    name: user.name || tSync('profilePage_name_missing'),
    registrationDate: user.registrationDate || '2025-12-24',
    title: user.desiredEmploymentType || tSync('profilePage_default_title'),
    employmentType: user.desiredEmploymentType || tSync('profilePage_default_employmentType'),
    location: user.location || tSync('profilePage_default_location'),
    region: user.desiredCity || tSync('profilePage_default_region'),
    phone: user.phoneNumber || tSync('profilePage_default_phone'),
    email: user.email,
    tags:
      analysisResult && (analysisResult.hardSkills || analysisResult.softSkills)
        ? [
            ...(analysisResult.hardSkills || []),
            ...(analysisResult.softSkills || [])
          ]
        : user.competencies || [
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

  // Extract and display the latest AIResponse (analysis) from aiResponses
  let latestAIResponse: any = null;
  let latestAIAnalysis: any = null;
  if (Array.isArray(user.aiResponses) && user.aiResponses.length > 0) {
    latestAIResponse = user.aiResponses.reduce(
      (latest: any, curr: any) => {
        if (!latest) return curr;
        const latestDate = new Date(latest.createdAt || latest.CreatedAt || 0);
        const currDate = new Date(curr.createdAt || curr.CreatedAt || 0);
        return currDate > latestDate ? curr : latest;
      },
      null
    );
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
            tSync={tSync}
          />
          <FileDropZoneCard tSync={tSync} handleCVUpload={handleCVUpload} />
          <ButtonsCard tSync={tSync}/>
        </div>
      </PageWrapper>
    </>
  );
}

export default ProfilePage;

