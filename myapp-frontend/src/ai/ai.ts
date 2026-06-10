import { SettingsService } from '../db/SettingsService';

export type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama';

export const AI_PROVIDERS: Record<AiProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
  ollama: 'Ollama (lokal)',
};

interface ChatOpts {
  temperature?: number;
  jsonMode?: boolean;
}

// ── Provider implementations ─────────────────────────────────────────────────

async function _openai(system: string, user: string, opts: ChatOpts): Promise<string> {
  const key = await SettingsService.get('openai_key');
  if (!key) throw new Error('OpenAI API-nyckel saknas. Ange den under Inställningar.');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: opts.temperature ?? 0.7,
      ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.choices[0].message.content as string;
}

async function _anthropic(system: string, user: string, opts: ChatOpts): Promise<string> {
  const key = await SettingsService.get('anthropic_key');
  if (!key) throw new Error('Anthropic API-nyckel saknas. Ange den under Inställningar.');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: user }],
      temperature: opts.temperature ?? 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.content[0].text as string;
}

async function _gemini(system: string, user: string, opts: ChatOpts): Promise<string> {
  const key = await SettingsService.get('gemini_key');
  if (!key) throw new Error('Google Gemini API-nyckel saknas. Ange den under Inställningar.');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0.7,
        ...(opts.jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.candidates[0].content.parts[0].text as string;
}

async function _ollama(system: string, user: string, opts: ChatOpts): Promise<string> {
  const ollamaUrl = (await SettingsService.get('ollama_url')) ?? 'http://localhost:11434';
  const model = (await SettingsService.get('ollama_model')) ?? 'llama3';
  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      options: { temperature: opts.temperature ?? 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.message.content as string;
}

// ── Core routing ─────────────────────────────────────────────────────────────

async function _chat(system: string, user: string, opts: ChatOpts = {}): Promise<string> {
  const provider = ((await SettingsService.get('ai_provider')) ?? 'openai') as AiProvider;
  switch (provider) {
    case 'openai':    return _openai(system, user, opts);
    case 'anthropic': return _anthropic(system, user, opts);
    case 'gemini':    return _gemini(system, user, opts);
    case 'ollama':    return _ollama(system, user, opts);
    default: throw new Error(`Okänd AI-leverantör: ${provider}`);
  }
}

function _stripMarkdown(text: string): string {
  return text.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '').trim();
}

async function _chatJSON<T = unknown>(system: string, user: string, opts: ChatOpts = {}): Promise<T> {
  const raw = await _chat(system, user, { ...opts, jsonMode: true });
  return JSON.parse(_stripMarkdown(raw)) as T;
}

// ── Public domain functions ───────────────────────────────────────────────────

export async function structureCV(text: string): Promise<unknown> {
  return _chatJSON(
    'Du är en expert på CV-analys. Returnera alltid giltig JSON utan förklaring.',
    `Strukturera följande CV-text som JSON med fälten: name, title, skills (array), experience (array), education (array), languages (array).\n\n${text}`,
  );
}

export async function matchJob(cvText: string, jobText: string): Promise<unknown> {
  return _chatJSON(
    'Du är en expert på rekrytering och matchning av kandidater. Returnera alltid giltig JSON utan förklaring.',
    `Matcha CV mot jobbannonsen. Returnera JSON med: score (0–100), strengths (array), gaps (array), summary (sträng).\n\nCV:\n${cvText}\n\nJobbannons:\n${jobText}`,
  );
}

export async function suggestJobTitles(cvText: string): Promise<string[]> {
  const result = await _chatJSON<{ titles: string[] }>(
    'Du är en expert på yrkesroller och karriär. Returnera alltid giltig JSON utan förklaring.',
    `Utifrån detta CV, föreslå de 5 mest passande jobbtitlarna. Returnera JSON: { "titles": ["...", ...] }\n\n${cvText}`,
  );
  return result.titles ?? [];
}

// ── Window exposure for console debugging ────────────────────────────────────

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).cvAI = {
    structureCV,
    matchJob,
    suggestJobTitles,
  };
}
