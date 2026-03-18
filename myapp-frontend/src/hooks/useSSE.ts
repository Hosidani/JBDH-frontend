import { ApiService } from '../services/ApiService';
import { useEffect } from 'react';

interface ProgressData {
  progress: number;
  message?: string;
  [key: string]: any;
}


export function useSSE(
  url: string,
  formData: FormData | null,
  onProgress: (data: ProgressData) => void,
  onComplete: (result: any) => void,
  onError: (error: string) => void
) {

  useEffect(() => {
    if (!formData) return;
    let abort = false;
    const controller = new AbortController();

    ApiService.fetchWithAuth(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'text/event-stream',
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.body) throw new Error('No SSE body');
        const reader = response.body.getReader();
        let buffer = '';
        let done = false;
        while (!abort) {
          const { value, done: streamDone } = await reader.read();
          if (streamDone) break;
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
              } catch {
                onError('Kunde inte tolka SSE-data.');
              }
            }
          }
        }
      })
      .catch(() => {
        if (!abort) onError('Nätverksfel vid SSE.');
      });

    return () => {
      abort = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, formData]);
}
