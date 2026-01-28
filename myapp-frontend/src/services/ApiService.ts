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

export type { JobDetailsDto };

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export class ApiService {
    // Get another user's profile by userId
    static async getProfile(userId: number): Promise<any> {
      const response = await this.fetchWithAuth(`/Profile/getprofile/${userId}`, {
        method: 'GET',
      });
      return await response.json();
    }

    // Get current user's profile
    static async getMyProfile(): Promise<any> {
      const response = await this.fetchWithAuth('/Profile/getmyprofile', {
        method: 'GET',
      });
      return await response.json();
    }

    // Update current user's settings
    static async updateUserSettings(dto: any): Promise<any> {
      const response = await this.fetchWithAuth('/Settings/updateusersettings', {
        method: 'PUT',
        body: JSON.stringify(dto),
      });
      return await response.json();
    }

    // Change current user's password
    static async changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<any> {
      const response = await this.fetchWithAuth('/Settings/changepassword', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      return await response.json();
    }

    // Delete current user
    static async deleteMyUser(): Promise<any> {
      const response = await this.fetchWithAuth('/Settings/deletemyuser', {
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
      const response = await this.fetchWithAuth('/Settings/getaccountsettings', {
        method: 'GET',
      });
      return await response.json();
    }

    // Get available organisations for user to join
    static async getAvailableOrganisations(): Promise<any> {
      const response = await this.fetchWithAuth('/Settings/getavailableorganisations', {
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
      const response = await this.fetchWithAuth('/Settings/updateaccountsettings', {
        method: 'PUT',
        body: JSON.stringify(accountData),
      });
      return await response.json();
    }

    // Terminate current user's account
    static async terminateAccount(): Promise<any> {
      const response = await this.fetchWithAuth('/Settings/terminateaccount', {
        method: 'POST',
      });
      return await response.json();
    }
  private static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

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

  // Upload CV for AI analysis
  static async uploadCVForAnalysis(cvFile: File, language?: string): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('cvFile', cvFile);
    if (language) {
      formData.append('language', ApiService.mapLanguageToBackend(language));
    }
    const response = await fetch(`${API_BASE_URL}/Profile/AnalyzeCV`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Poll for latest AI user response
  static async getLatestAIUserResponse(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/Profile/LatestAIUserResponse`, {
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
  static async searchJobs(searchParams: any): Promise<JobDetailsDto[]> {
    const params = new URLSearchParams();
    if (searchParams.location) params.append('location', searchParams.location);
    if (searchParams.workArea) params.append('workArea', searchParams.workArea);
    if (searchParams.jobDescription) params.append('description', searchParams.jobDescription);
    if (searchParams.roles) params.append('roles', searchParams.roles);
    if (searchParams.competencies) params.append('competencies', searchParams.competencies);
    if (searchParams.useProfile) params.append('useProfile', 'true');

    const response = await fetch(`${API_BASE_URL}/Search/SearchForJobs?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    return await response.json();
  }
}