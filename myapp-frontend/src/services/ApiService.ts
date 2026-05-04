import type { ListDataFlowViewModel, CreateFlowRequest, CommentRequest, ReportRequest } from '../components/DataFlow/types';

interface JobDetailsDto {
  jobId: number;
  title?: string;
  description?: string;
  company?: string;
  location?: string;
  postedDate?: string;
  webpageUrl?: string;
  
  // NYA FÄLT
  workType?: string;
  employmentType?: string;
  externalJobId?: string;
  applicationDeadline?: string;
  requiredSkills: string[];
  requiredSoftSkills: string[];
  
  // USER ACTIONS
  isSaved: boolean;
  hasApplied: boolean;
  isNotInterested: boolean;
  notes?: string;
}

export interface JobSearchResponse {
    results: JobDetailsDto[];
    total: number;
    offset: number;
    limit: number;
    has_more: boolean;
}

interface SearchParams {
    location?: string;
    workArea?: string;
    jobDescription?: string;
    roles?: string;
    competence?: string;
    useProfile?: boolean;
    offset?: number;
    limit?: number;
}

export type { JobDetailsDto };

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

export class ApiService {
  // JWT Token Management
  private static getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private static getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }


  static clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Shared login method for DRY principle
  static async loginUser(email: string, password: string): Promise<{ user: any; access?: string; refresh?: string; error?: string }> {
    const API_URL = `${import.meta.env.VITE_API_URL}`;
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.access && data.refresh) {
          ApiService.setTokens(data.access, data.refresh);
        }
        const userInfo = data.user || { email };
        return { user: userInfo, access: data.access, refresh: data.refresh };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { user: null, error: errorData.detail || 'Invalid credentials' };
      }
    } catch (err: any) {
      return { user: null, error: err?.message || 'Login failed' };
    }
  }

  // Refresh the access token using the refresh token
  private static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const refreshUrl = `${API_BASE_URL}/auth/refresh/`;
      console.log(`🔄 [REFRESH TOKEN] POST ${refreshUrl}`);

      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access;
        localStorage.setItem('access_token', newAccessToken);
        console.log('✅ [REFRESH SUCCESS] New token obtained');
        return newAccessToken;
      } else {
        console.log(`❌ [REFRESH FAILED] ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }

    // If refresh fails, clear tokens and notify the app
    this.clearTokens();
    window.dispatchEvent(new CustomEvent('sessionExpired'));
    return null;
  }
  // Get another user's profile by userId
  static async getProfile(userId: number): Promise<any> {
    const response = await this.fetchWithAuth(`/profile/getprofile/${userId}`, {
      method: 'GET',
    });
    return await response.json();
  }

  // Get current user's profile
  static async getMyProfile(): Promise<any> {
    const response = await this.fetchWithAuth('/profile/getmyprofile', {
      method: 'GET',
    });
    const data = await response.json();
    // Map backend snake_case to camelCase used by frontend components/hooks.
    if (data && data.ai_responses && !data.aiResponses) {
      data.aiResponses = data.ai_responses;
    }
    return data;
  }

  // Update current user's settings
  static async updateUserSettings(dto: any): Promise<any> {
    const response = await this.fetchWithAuth('/settings/updateusersettings', {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return await response.json();
  }

  // Change current user's password
  static async changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<any> {
    const response = await this.fetchWithAuth('/settings/changepassword', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
    });
    return await response.json();
  }

  // Delete current user
  static async deleteMyUser(): Promise<any> {
    const response = await this.fetchWithAuth('/settings/deletemyuser', {
      method: 'DELETE',
    });
    // Backend may redirect or return a message
    if (response.headers.get('content-type')?.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  }

  // Get current user's account settings
  static async getAccountSettings(): Promise<any> {
    const response = await this.fetchWithAuth('/settings/getaccountsettings', {
      method: 'GET',
    });
    return await response.json();
  }

  // Get available organisations for user to join
  static async getAvailableOrganisations(): Promise<any> {
    const response = await this.fetchWithAuth('/settings/getavailableorganisations', {
      method: 'GET',
    });
    return await response.json();
  }

  // Update current user's account settings
  static async updateAccountSettings(accountData: {
    accountName?: string;
    accountEmail?: string;
    accountPhone?: string;
    preferredLanguage?: string;
    accountType?: string;
    acceptedTermsAndConditions?: boolean;
    updateRoles?: string[];
    joinOrganisationIds?: number[];
    leaveOrganisationIds?: number[];
  }): Promise<any> {
    const response = await this.fetchWithAuth('/settings/updateaccountsettings', {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
    return await response.json();
  }

  static async submitFeedback(payload: {
    text: string;
    url: string;
    accountName: string;
    accountEmail: string;
    timestamp: string;
  }): Promise<void> {
    await this.fetchWithAuth('/feedback/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  // Terminate current user's account
  static async terminateAccount(): Promise<any> {
    const response = await this.fetchWithAuth('/settings/terminateaccount', {
      method: 'POST',
    });
    return await response.json();
  }
  public static async fetchWithAuth(url: string, options: RequestInit = {}) {
    let accessToken = this.getAccessToken();
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log(`🌐 [API CALL] ${options.method || 'GET'} ${fullUrl}`);
    console.log(`🔑 [TOKEN] ${accessToken ? 'Bearer ' + accessToken.substring(0, 20) + '...' : 'No token'}`);

    // Bygg headers dynamiskt
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    // Sätt INTE Content-Type om body är FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    let response = await fetch(fullUrl, {
      ...options,
      credentials: 'include',
      headers: {
        ...headers,
        ...options.headers, // options.headers har prio sist
      },
    });

    // If 401, try to refresh token and retry
    if (response.status === 401) {
      console.log('⚠️  [401] Attempting token refresh...');
      const newAccessToken = await this.refreshAccessToken();
      if (newAccessToken) {
        const retryHeaders: Record<string, string> = {
          'Authorization': `Bearer ${newAccessToken}`,
        };
        // Sätt INTE Content-Type om body är FormData
        if (!(options.body instanceof FormData)) {
          retryHeaders['Content-Type'] = 'application/json';
        }
        response = await fetch(fullUrl, {
          ...options,
          credentials: 'include',
          headers: {
            ...retryHeaders,
            ...options.headers,
          },
        });
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  // Get all data flows (Home page)
  static async getDataFlows(): Promise<ListDataFlowViewModel> {
    const response = await this.fetchWithAuth('/home');
    const data = await response.json();
    
    return {
      dataFlows: data.dataFlows || []
    };
  }

  // Create a new data flow
  static async createDataFlow(flowData: CreateFlowRequest): Promise<void> {
    await this.fetchWithAuth('/home/CreateFlow', {
      method: 'POST',
      body: JSON.stringify(flowData),
    });
  }

  // Add a comment to a data flow
  static async commentOnDataFlow(commentData: CommentRequest): Promise<void> {
    await this.fetchWithAuth('/home/CommentOnDataFlow', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  // Report a data flow
  static async reportDataFlow(reportData: ReportRequest): Promise<void> {
    await this.fetchWithAuth('/home/ReportDataFlow', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // Delete a data flow
  static async deleteDataFlow(id: number): Promise<void> {
    await this.fetchWithAuth(`/home/Delete/${id}`, {
      method: 'DELETE',
    });
  }

  // Compare CV to Job Ad
  static async compareCvToJobAd(jobAdText: string, cvFile: File, language?: string): Promise<string> {
    const formData = new FormData();
    formData.append('jobAdText', jobAdText);
    formData.append('cvPath', cvFile);
    if (language) {
      formData.append('language', ApiService.mapLanguageToBackend(language));
    }

    const response = await fetch(`${API_BASE_URL}/home/CompareCvToJobAd`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  }

  // Compare CV to Job Ad V2 (med JWT via fetchWithAuth)
  
  

  // Upload CV for AI analysis
  static async uploadCVForAnalysis(cvFile: File, language?: string): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('cv_file', cvFile);
    if (language) {
      formData.append('language', ApiService.mapLanguageToBackend(language));
    }
    const response = await this.fetchWithAuth('/profile/analyzecv/', {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  }

  // Poll for latest AI user response
  static async getLatestAIUserResponse(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/profile/latestaiuserresponse`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Map frontend language codes to backend-friendly names
  private static mapLanguageToBackend(lang: string): string {
    switch ((lang || '').toLowerCase()) {
      case 'sv':
      case 'sv-se':
      case 'swedish':
        return 'Swedish';
      case 'en':
      case 'en-us':
      case 'english':
      default:
        return 'English';
    }
  }

  /**
   * Starta SSE-anrop för CV/Jobb-matchning med JWT och progress.
   * @param formData FormData med CvPath och JobAdText
   * @param onProgress Callback för progress (progress<100)
   * @param onComplete Callback för slutresultat (progress=100)
   * @param onError Callback för fel
   * @returns cleanup-funktion för att avbryta SSE
   */
  static compareCvToJobAdSSE(
    formData: FormData,
    onProgress: (data: {progress: number, message?: string, vectorResult?: any}) => void,
    onComplete: (result: any) => void,
    onError: (error: string) => void
  ): () => void {
    const abortController = new AbortController();
    // Use fetchWithAuth for DRY principle
    this.fetchWithAuth('/home/CompareCvJobSSE', {
      method: 'POST',
      headers: {
        'Accept': 'text/event-stream',
      },
      body: formData,
      signal: abortController.signal,
      credentials: 'include',
    })
      .then((response: Response) => {
        if (!response.body) throw new Error('Ingen SSE-stream.');
        const reader = response.body.getReader();
        let buffer = '';
        let done = false;
        function read() {
          reader.read().then(({ done: streamDone, value }) => {
            if (streamDone) {
              if (!done) {
                done = true;
                onError('SSE-anslutning stängdes oväntat.');
              }
              return;
            }
            buffer += new TextDecoder().decode(value);
            let idx;
            while ((idx = buffer.indexOf('\n\n')) !== -1) {
              const event = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 2);
              if (event.startsWith('data: ')) {
                try {
                  const data = JSON.parse(event.replace('data: ', ''));
                  if (typeof data.progress === 'number') {
                    if (data.progress < 100) {
                      onProgress(data);
                    } else if (data.result) {
                      if (!done) {
                        done = true;
                        onComplete(data.result);
                      }
                    } else if (data.error) {
                      if (!done) {
                        done = true;
                        onError(data.error);
                      }
                    }
                  }
                } catch (err) {
                  onError('Kunde inte tolka SSE-data.');
                }
              }
            }
            if (!done) read();
          });
        }
        read();
      })
      .catch(err => {
        onError('Nätverksfel vid SSE: ' + (err?.message || err));
      });

    // Returnera cleanup-funktion för att kunna avbryta SSE från komponenten
    return () => abortController.abort();
  }

  // === JOB API METHODS ===

  // Get job details by ID
  static async getJobDetails(jobId: number): Promise<JobDetailsDto> {
    const response = await this.fetchWithAuth(`/Jobs/${jobId}`, {
      method: 'GET',
    });
    return await response.json();
  }

  // Check if job is saved by current user
  static async isJobSaved(jobId: number): Promise<{ jobId: number; isSaved: boolean }> {
    const response = await this.fetchWithAuth(`/Jobs/${jobId}/issaved`, {
      method: 'GET',
    });
    return await response.json();
  }

  // Save/Bookmark a job
  static async saveJob(jobId: number, notes?: string): Promise<void> {
    const body = notes ? JSON.stringify({ notes }) : undefined;
    const response = await this.fetchWithAuth(`/Jobs/${jobId}/save`, {
      method: 'POST',
      body,
    });
    if (!response.ok) {
      throw new Error(`Failed to save job: ${response.status}`);
    }
  }

  // Update job save with new notes
  static async updateSavedJob(jobId: number, notes?: string): Promise<void> {
    const response = await this.fetchWithAuth(`/Jobs/${jobId}/save`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update saved job: ${response.status}`);
    }
  }

  // Unsave/Remove bookmark from job
  static async unsaveJob(jobId: number): Promise<void> {
    const response = await this.fetchWithAuth(`/Jobs/${jobId}/unsave`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to unsave job: ${response.status}`);
    }
  }

  // Get all saved jobs for current user
  static async getSavedJobs(): Promise<JobDetailsDto[]> {
    const response = await this.fetchWithAuth('/jobs/saved', {
      method: 'GET',
    });
    return await response.json();
  }

  // Update notes for a saved job
  static async updateJobNotes(jobId: number, notes: string): Promise<any> {
    const response = await this.fetchWithAuth(`/jobs/${jobId}/save`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notes: notes
      })
    });
    return await response.json();
  }

  // Mark job as not interested
  static async markNotInterested(jobId: number): Promise<void> {
    const response = await this.fetchWithAuth(`/Jobs/${jobId}/not-interested`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to mark job as not interested: ${response.status}`);
    }
  }

  // Search jobs - call real backend API
  static async searchJobs(searchParams: SearchParams): Promise<JobSearchResponse> {
    const params = new URLSearchParams();
    if (searchParams.location) params.append('location', searchParams.location);
    if (searchParams.workArea) params.append('workArea', searchParams.workArea);
    if (searchParams.jobDescription) params.append('description', searchParams.jobDescription);
    if (searchParams.roles) params.append('roles', searchParams.roles);
    if (searchParams.competence) params.append('competence', searchParams.competence);
    if (searchParams.useProfile) params.append('useProfile', 'true');

    params.append('offset', (searchParams.offset ?? 0).toString());
    params.append('limit', (searchParams.limit ?? 20).toString());

    const response = await fetch(`${API_BASE_URL}/Search/SearchV2?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    return await response.json();
  }

  // === EXTERNAL CVs ===

  static async getExternalCVs(): Promise<{ id: number; name: string; text: string; created_at: string }[]> {
    const response = await this.fetchWithAuth('/external-cvs/', { method: 'GET' });
    return await response.json();
  }

  static async createExternalCV(text: string, name?: string): Promise<{ id: number; name: string; text: string; created_at: string }> {
    const response = await this.fetchWithAuth('/external-cvs/', {
      method: 'POST',
      body: JSON.stringify({ text, name: name || undefined }),
    });
    return await response.json();
  }

  static async deleteExternalCV(id: number): Promise<void> {
    await this.fetchWithAuth(`/external-cvs/${id}/`, { method: 'DELETE' });
  }

  static async updateExternalCVName(id: number, name: string): Promise<{ id: number; name: string; text: string; created_at: string }> {
    const response = await this.fetchWithAuth(`/external-cvs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    return await response.json();
  }

  static async updateExternalCVPDF(id: number, file: File, name?: string): Promise<{ id: number; name: string; text: string; created_at: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    const response = await this.fetchWithAuth(`/external-cvs/${id}/upload-pdf/`, { method: 'PATCH', body: formData });
    if (!response.ok) throw new Error(`Update failed: ${response.status}`);
    return await response.json();
  }

  /** Upload a PDF/DOCX file → backend extracts text → saves as ExternalCV */
  static async uploadCVPDF(file: File, name?: string): Promise<{ id: number; name: string; text: string; created_at: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    const response = await this.fetchWithAuth('/external-cvs/upload-pdf/', { method: 'POST', body: formData });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    return await response.json();
  }

  // === EXTERNAL JOB ADS ===

  static async getExternalJobAds(): Promise<{ id: number; name: string; text: string; created_at: string }[]> {
    const response = await this.fetchWithAuth('/external-job-ads/', { method: 'GET' });
    return await response.json();
  }

  static async createExternalJobAd(text: string, name?: string): Promise<{ id: number; name: string; text: string; created_at: string }> {
    const response = await this.fetchWithAuth('/external-job-ads/', {
      method: 'POST',
      body: JSON.stringify({ text, name: name || undefined }),
    });
    return await response.json();
  }

  static async deleteExternalJobAd(id: number): Promise<void> {
    await this.fetchWithAuth(`/external-job-ads/${id}/`, { method: 'DELETE' });
  }

  static async updateExternalJobAdName(id: number, name: string): Promise<{ id: number; name: string; text: string; created_at: string }> {
    const response = await this.fetchWithAuth(`/external-job-ads/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    return await response.json();
  }

  static async updateExternalJobAd(id: number, text: string, name?: string): Promise<{ id: number; name: string; text: string; created_at: string }> {
    const response = await this.fetchWithAuth(`/external-job-ads/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ text, ...(name !== undefined ? { name } : {}) }),
    });
    return await response.json();
  }
}