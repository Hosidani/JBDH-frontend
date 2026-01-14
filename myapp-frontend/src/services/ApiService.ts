import type { ListDataFlowViewModel, CreateFlowRequest, CommentRequest, ReportRequest } from '../types/DataFlow';

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
}