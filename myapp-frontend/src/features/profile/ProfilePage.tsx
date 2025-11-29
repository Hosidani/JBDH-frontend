import { useState, useEffect } from 'react';
import { ApiService } from '../../services/ApiService';
import ProfileInfoCard from '../../components/ProfileInfoCard';
import FileDropZone from '../../components/FileDropZone';

import SavedJobCard from '../../components/SavedJobCard';
import { useTranslation } from '../../hooks/TranslationProvider';

const API_URL = import.meta.env.VITE_API_URL;

function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [polling, setPolling] = useState(false);
  const { tSync, ready } = useTranslation();

  // Normalize analysis keys from PascalCase to camelCase
  function normalizeAnalysisKeys(analysis: any) {
    // ...existing code...
    return analysis;
  }

  // Fetch profile and AI analysis
  const fetchProfileAndAI = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile info
      const response = await fetch(`${API_URL}/api/profile`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);

      // Fetch latest AI user response
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
      } catch {
        // Ignore errors, fallback to profile fields
      }

      // Fallback to profile fields if no AI response
      if (!aiAnalysis && data) {
        if (data.CVAnalysis) {
          aiAnalysis = data.CVAnalysis;
        } else if (data.CVAnalysisJson) {
          try {
            aiAnalysis = JSON.parse(data.CVAnalysisJson);
            if (typeof aiAnalysis === 'string') {
              try { aiAnalysis = JSON.parse(aiAnalysis); } catch { aiAnalysis = null; }
            }
          } catch { aiAnalysis = null; }
        } else if (data.cvAnalysisResult) {
          aiAnalysis = data.cvAnalysisResult;
        } else if (data.userAIResponse && (data.userAIResponse.analysis || data.userAIResponse.analysisResult || data.userAIResponse.responseText)) {
          if (data.userAIResponse.analysis) {
            aiAnalysis = data.userAIResponse.analysis;
          } else if (data.userAIResponse.analysisResult) {
            aiAnalysis = data.userAIResponse.analysisResult;
          } else if (data.userAIResponse.responseText) {
            try {
              aiAnalysis = JSON.parse(data.userAIResponse.responseText);
              if (typeof aiAnalysis === 'string') {
                try { aiAnalysis = JSON.parse(aiAnalysis); } catch { aiAnalysis = null; }
              }
            } catch { aiAnalysis = null; }
          }
        }
      }
      setAnalysisResult(aiAnalysis);
    } catch (err) {
      const errorMsg = (err as any)?.message || 'Något gick fel.';
      setError(errorMsg);
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Poll for latest AI analysis result, but only stop when a new/different response is detected
  const pollForAIAnalysis = async (maxAttempts = 20, interval = 3000) => {
    let attempts = 0;
    // Get the current/latest AI response before upload
    let previousId = null;
    try {
      const prev = await ApiService.getLatestAIUserResponse();
      // Try to use a unique property (id, createdAt, updatedAt, etc.)
      previousId = prev?.id || prev?.createdAt || prev?.updatedAt || JSON.stringify(prev);
    } catch {}

    while (attempts < maxAttempts) {
      try {
        const aiResponse = await ApiService.getLatestAIUserResponse();
        let parsed = null;
        let currentId = null;
        if (aiResponse) {
          if (aiResponse.analysis) {
            parsed = aiResponse.analysis;
          } else if (aiResponse.analysisResult) {
            parsed = aiResponse.analysisResult;
          } else if (aiResponse.responseText) {
            try {
              parsed = JSON.parse(aiResponse.responseText);
              if (typeof parsed === 'string') {
                try {
                  parsed = JSON.parse(parsed);
                } catch {
                  parsed = null;
                }
              }
            } catch (e) {
              // ignore parse error
            }
          }
          // Use a unique property to detect change
          currentId = aiResponse?.id || aiResponse?.createdAt || aiResponse?.updatedAt || JSON.stringify(aiResponse);
        }
        // Only stop polling if the response is new/different
        if (parsed && currentId && currentId !== previousId) {
          setAnalysisResult(parsed);
          setPolling(false);
          await fetchProfileAndAI();
          return;
        }
      } catch (err) {
        setPolling(false);
        return;
      }
      await new Promise(res => setTimeout(res, interval));
      attempts++;
    }
    setPolling(false);
  };

  useEffect(() => {
    fetchProfileAndAI();
  }, []);

  // Handle CV upload
  const handleCVUpload = async (file: File) => {
    setAnalysisResult(null);
    try {
      await ApiService.uploadCVForAnalysis(file);
      setPolling(true);
      pollForAIAnalysis();
    } catch (err: any) {
    }
  };


  if (!ready) return <div className="card">{tSync('profilePage_loading_language')}</div>;
  if (loading) return <div className="card">{tSync('profilePage_loading_profile')}</div>;
  if (error) return <div className="card text-red-600">{tSync('profilePage_error_prefix')}{error}</div>;
  if (!profile) return <div className="card">{tSync('profilePage_no_profile_found')}</div>;

  // If profile exists but user is missing
  if (!profile.user) {
    return (
      <div className="card text-yellow-700 bg-yellow-50 border border-yellow-200">
        {tSync('profilePage_no_user_info')}
      </div>
    );
  }

  const user = profile.user;

  let safeAnalysis = null;
  if (analysisResult && typeof analysisResult === 'object' && !Array.isArray(analysisResult)) {
    safeAnalysis = normalizeAnalysisKeys(analysisResult);
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 flex flex-col gap-8">
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
      {/* AI analysis card (moved up) */}
      <div className="bg-white border border-blue-200 rounded-xl shadow p-6 mt-4 max-w-2xl mx-auto flex flex-col gap-6 min-h-[200px]">
        <h3 className="font-bold text-lg mb-2 text-blue-700">{tSync('profilePage_ai_analysis_title')}</h3>
        {polling ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-blue-600 text-lg font-semibold mb-2">{tSync('profilePage_polling_waiting')}</div>
            <div className="animate-spin text-4xl">🔄</div>
            <div className="text-slate-500 text-sm mt-4">{tSync('profilePage_polling_hint')}</div>
          </div>
        ) : safeAnalysis ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Best job titles */}
              <div>
                <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_bestJobTitles_titel')}</div>
                <div className="flex flex-wrap gap-2">
                  {safeAnalysis.bestJobTitlesForUser?.map((title: string) => (
                    <span key={title} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-green-200">{title}</span>
                  ))}
                </div>
              </div>
              {/* Reasoning */}
              <div>
                <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_reasoning_title')}</div>
                <div className="text-slate-700 text-sm bg-slate-50 rounded p-3 border border-slate-100 min-h-[60px]">{safeAnalysis.reasoningBehindJobTitles}</div>
              </div>
            </div>
            <hr className="my-2 border-slate-200" />
            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_hardSkills_title')}</div>
                <div className="flex flex-wrap gap-2">
                  {safeAnalysis.hardSkills?.map((skill: string) => (
                    <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_softSkills_title')}</div>
                <div className="flex flex-wrap gap-2">
                  {safeAnalysis.softSkills?.map((skill: string) => (
                    <span key={skill} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold border border-purple-200">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            <hr className="my-2 border-slate-200" />
            {/* Experiences */}
            {safeAnalysis.experiences && safeAnalysis.experiences.length > 0 && (
              <div>
                <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_experiences_title')}</div>
                <ul className="space-y-1 mt-1">
                  {safeAnalysis.experiences.map((exp: any, idx: number) => (
                    <li key={idx} className="text-slate-700 text-sm flex items-center">
                      <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      <span>{exp.title}</span>
                      <span className="text-slate-400 ml-2">({exp.duration})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Education and Certifications */}
            {safeAnalysis.educationAndCertifications && safeAnalysis.educationAndCertifications.length > 0 && (
              <div>
                <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_educationCerts_title')}</div>
                <ul className="space-y-1 mt-1">
                  {safeAnalysis.educationAndCertifications.map((ed: string, idx: number) => (
                    <li key={idx} className="text-slate-700 text-sm flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      <span>{ed}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="text-slate-500 text-sm">{tSync('profilePage_no_ai_analysis_found')}</div>
        )}
      </div>

      {/* Upload zones */}
      <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
        <FileDropZone
          label={tSync('profilePage_cv_dropzone_label')}
          description={tSync('profilePage_cv_dropzone_description')}
          accept=".pdf"
          onFileSelected={handleCVUpload}
        />
        <FileDropZone
          label={tSync('profilePage_coverletter_dropzone_label')}
          description={tSync('profilePage_coverletter_dropzone_description')}
          accept=".pdf"
          onFileSelected={() => { /* handle cover letter upload */ }}
        />
      </div>
      {/* Action buttons */}
      <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
        <button className="bg-blue-600 text-white px-8 py-3 rounded font-semibold text-lg shadow hover:bg-blue-700 transition">{tSync('profilePage_match_now_button')}</button>
        <button className="bg-white border border-blue-600 text-blue-700 px-8 py-3 rounded font-semibold text-lg shadow hover:bg-blue-50 transition">{tSync('profilePage_manual_search_button')}</button>
      </div>
      {/* Saved jobs section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">{tSync('profilePage_saved_jobs_title')}</h3>
        {profile.jobApplications.length === 0 ? (
          <div className="text-slate-500 text-sm">{tSync('profilePage_no_saved_jobs')}</div>
        ) : (
          profile.jobApplications.map((app: any) => (
            <SavedJobCard
              key={app.applicationId}
              jobTitle={app.jobTitle}
              company={app.jobDescription.split('|')[0] || ''}
              location={app.jobDescription.split('|')[1] || ''}
              tags={[tSync('profilePage_tag_it'), tSync('profilePage_tag_stockholm')]} // Replace with real tags if available
              status={tSync('profilePage_job_status_applied')}
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
}

export default ProfilePage;
