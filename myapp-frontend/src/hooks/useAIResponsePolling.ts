import { useState, useCallback } from 'react';
import { ApiService } from '../services/ApiService';

export const useAIResponsePolling = () => {
  const [polling, setPolling] = useState(false);

  const getLatestAIResponseId = useCallback((aiResponses: any[]) => {
    if (!Array.isArray(aiResponses) || aiResponses.length === 0) return null;
    const latest = aiResponses.reduce((latest: any, curr: any) => {
      if (!latest) return curr;
      const latestDate = new Date(latest.createdAt || latest.CreatedAt || 0);
      const currDate = new Date(curr.createdAt || curr.CreatedAt || 0);
      return currDate > latestDate ? curr : latest;
    }, null);
    return latest?.id || latest?.ID || latest?.createdAt || latest?.CreatedAt || null;
  }, []);

  const pollForLatestAIResponse = useCallback(
    async (initialLatestId: any, onProfileUpdate: (profile: any) => void) => {
      let attempts = 0;
      const maxAttempts = 30;
      while (attempts < maxAttempts) {
        try {
          const data = await ApiService.getMyProfile();
          // Map ai_responses to aiResponses for frontend compatibility
          if (data.ai_responses && !data.aiResponses) {
            data.aiResponses = data.ai_responses;
          }
          onProfileUpdate(data);
          const newLatestId = getLatestAIResponseId(data.aiResponses);
          if (newLatestId && newLatestId !== initialLatestId) {
            setPolling(false);
            return;
          }
        } catch {}
        await new Promise(res => setTimeout(res, 2000));
        attempts++;
      }
      setPolling(false);
    },
    [getLatestAIResponseId]
  );

  return { polling, setPolling, getLatestAIResponseId, pollForLatestAIResponse };
};