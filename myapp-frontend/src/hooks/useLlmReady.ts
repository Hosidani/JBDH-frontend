import { useEffect, useState } from 'react';
import { isLlmConfigured } from '../ai/ai';

export const LLM_SETTINGS_EVENT = 'llm-settings-changed';

export function useLlmReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    isLlmConfigured().then(setReady);

    const handler = () => { isLlmConfigured().then(setReady); };
    window.addEventListener(LLM_SETTINGS_EVENT, handler);
    return () => window.removeEventListener(LLM_SETTINGS_EVENT, handler);
  }, []);

  return ready;
}
