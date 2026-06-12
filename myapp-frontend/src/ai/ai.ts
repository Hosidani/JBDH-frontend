import { SettingsService } from '../db/SettingsService';

export type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama';

export const AI_PROVIDERS: Record<AiProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
  ollama: 'Ollama (lokal)',
};

// ── Public types ──────────────────────────────────────────────────────────────

export interface StructuredCV {
  personal_info: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedin?: string | null;
  };
  summary?: string | null;
  work_experience: Array<{
    company?: string;
    position?: string;
    start_date?: string;
    end_date?: string;
    current?: boolean;
    description?: string;
    achievements?: string[];
    technologies?: string[];
  }>;
  education: Array<{
    institution?: string;
    degree?: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
  }>;
  skills: string[];
  certifications: Array<{
    name?: string;
    issuing_organization?: string;
    issue_date?: string;
  }>;
}

export interface StructuredJob {
  title?: string | null;
  required_skills?: string[];
  nice_to_have_skills?: string[];
  personal_qualities?: string[];
  min_experience_years?: number | null;
  seniority_level?: 'Junior' | 'Mid' | 'Senior' | 'Lead' | null;
  required_education?: string | null;
  city?: string | null;
  employment_type?: 'Heltid' | 'Deltid' | null;
  duration?: 'Tillsvidare' | 'Tidsbegränsat' | null;
  workplace?: 'På plats' | 'Hybrid' | 'Distans' | null;
  domain?: string | null;
  summary?: string | null;
  job_apply_latest?: string | null;
  job_company?: string | null;
}

export interface SeekerProfile {
  job_title?: string;
  preferred_city?: string;
  preferred_employment_type?: string;
  preferred_workplace?: string;
  preferred_domains?: string[];
  excluded_domains?: string[];
}

export interface SkillMatch {
  skill_name: string;
  score: number;
  reason: string;
  is_required: boolean;
}

export interface ExperienceMatch {
  id: string;
  score: number;
  reason: string;
}

export interface ProfileFitItem {
  aspect: string;
  job_value: string;
  preference: string;
  match: boolean | null;
  note: string;
}

export interface MatchResult {
  overall_score: number;
  summary: string;
  job_info: {
    city?: string | null;
    employment_type?: string | null;
    duration?: string | null;
    workplace?: string | null;
    domain?: string | null;
  };
  profile_fit: ProfileFitItem[];
  skills: SkillMatch[];
  experiences: ExperienceMatch[];
  missing_required_skills: string[];
  missing_nice_to_have_skills: string[];
  matching_personal_qualities: string[];
  missing_personal_qualities: string[];
}

// ── Internal chat opts ────────────────────────────────────────────────────────

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

// ── Language helper ──────────────────────────────────────────────────────────

function _langInstruction(): string {
  const lang = (typeof localStorage !== 'undefined' ? localStorage.getItem('language') : null) ?? 'sv';
  if (lang === 'en') return '\nAll generated text fields (summary, reason, etc.) must be written in English.';
  return '\nAlla genererade textfält (summary, reason, etc.) ska skrivas på svenska.';
}

// ── System prompts ────────────────────────────────────────────────────────────

const STRUCTURE_CV_SYSTEM = `Du är en expert på att extrahera strukturerad information från CV:n.
Svara ENDAST med JSON:
{
  "personal_info": { "full_name": null, "email": null, "phone": null, "location": null, "linkedin": null },
  "summary": null,
  "work_experience": [{
    "company": null, "position": null, "start_date": null, "end_date": null, "current": false,
    "description": null, "achievements": [], "technologies": []
  }],
  "education": [{ "institution": null, "degree": null, "field_of_study": null, "start_date": null, "end_date": null }],
  "skills": [],
  "certifications": [{ "name": null, "issuing_organization": null, "issue_date": null }]
}
Behåll all text på originalspråket. Extrahera ALL information.`;

function ANALYZE_JOB_SYSTEM(): string {
  return `Du är en expert på arbetsmarknad och rekrytering.
Svara ENDAST med JSON:
{
  "title": null, "required_skills": [], "nice_to_have_skills": [],
  "personal_qualities": [],
  "min_experience_years": null,
  "seniority_level": null,
  "required_education": null,
  "city": null, "employment_type": null,
  "duration": null,
  "workplace": null,
  "domain": null,
  "summary": null,
  "job_apply_latest": null,
  "job_company": null
}
Skilja tekniska kompetenser (required_skills, nice_to_have_skills) från personliga egenskaper (personal_qualities).
seniority_level är ett av: "Junior" | "Mid" | "Senior" | "Lead" | null
employment_type är ett av: "Heltid" | "Deltid" | null
duration är ett av: "Tillsvidare" | "Tidsbegränsat" | null
workplace är ett av: "På plats" | "Hybrid" | "Distans" | null
job_apply_latest: sista ansökningsdag som ISO-datum (YYYY-MM-DD). Om det inte framgår av annonsen, sätt null.
job_company: namnet på det företag eller den organisation där man faktiskt kommer att vara anställd (inte eventuellt rekryteringsbolag). Om det inte framgår, sätt null.
Om information saknas, sätt null.${_langInstruction()}`;
}

function _matchSystem(hasSeekerProfile: boolean): string {
  return `Du är en expert på rekrytering och kandidatmatchning. Svara ENDAST med JSON:
{
  "overall_score": 0,
  "summary": "",
  "job_info": { "city": null, "employment_type": null, "duration": null, "workplace": null, "domain": null },
  "profile_fit": [],
  "skills": [{ "skill_name": "", "score": 0, "reason": "", "is_required": false }],
  "experiences": [{ "id": "", "score": 0, "reason": "" }],
  "missing_required_skills": [],
  "missing_nice_to_have_skills": [],
  "matching_personal_qualities": [],
  "missing_personal_qualities": []
}
Regler:
- overall_score (0–100): sänk minst 20 poäng om obligatoriska kompetenser saknas
- Inkludera bara skills och experiences med score >= 25
- Sortera skills och experiences med högst poäng först
- Erfarenhets-id:n ska matcha [ID:x]-prefixet i kandidatens erfarenheter
${hasSeekerProfile
  ? '- Bygg profile_fit för aspekterna: Yrkesroll, Ort, Anställningsform, Arbetsplats, Domän — jämför jobbets värde mot kandidatens uppgifter\n- job_title är kandidatens nuvarande/önskade yrkesroll — bedöm om jobbet passar den rollen\n- Sänk overall_score minst 20 poäng om jobbets domän finns i excluded_domains'
  : '- Lämna profile_fit som tom lista []'}
${_langInstruction()}`;
}

function _formatExperiences(experiences: string[]): string {
  return experiences.map((e, i) => `[ID:${i}] ${e}`).join('\n');
}

// ── Public domain functions ───────────────────────────────────────────────────

export async function structureCV(cvText: string): Promise<StructuredCV> {
  return _chatJSON<StructuredCV>(
    STRUCTURE_CV_SYSTEM,
    `Strukturera detta CV:\n\n${cvText}`,
    { temperature: 0.1 },
  );
}

export async function analyzeJob(title: string, description: string): Promise<StructuredJob> {
  return _chatJSON<StructuredJob>(
    ANALYZE_JOB_SYSTEM(),
    `Jobbtitel: ${title}\n\nJobbannons:\n${description}`,
    { temperature: 0.1 },
  );
}

export async function matchJob(
  skills: string[],
  experiences: string[],
  jobTitle: string,
  jobDescription: string,
  seekerProfile?: SeekerProfile,
): Promise<MatchResult> {
  const seekerSection = seekerProfile
    ? `\nKANDIDATENS PREFERENSER:\n${JSON.stringify(seekerProfile, null, 2)}\n`
    : '';
  return _chatJSON<MatchResult>(
    _matchSystem(!!seekerProfile),
    `Matcha kandidaten mot jobbannonsen.\n\nKANDIDATENS KOMPETENSER:\n${skills.join('\n')}\n\nKANDIDATENS ERFARENHETER:\n${_formatExperiences(experiences)}\n\nJOBBTITEL: ${jobTitle}\nJOBBANNONS:\n${jobDescription}${seekerSection}`,
    { temperature: 0.2 },
  );
}

export async function matchJobStructured(
  skills: string[],
  experiences: string[],
  structuredJob: StructuredJob,
  seekerProfile?: SeekerProfile,
): Promise<MatchResult> {
  const seekerSection = seekerProfile
    ? `\nKANDIDATENS PREFERENSER:\n${JSON.stringify(seekerProfile, null, 2)}\n`
    : '';
  return _chatJSON<MatchResult>(
    _matchSystem(!!seekerProfile),
    `Matcha kandidaten mot det strukturerade jobbet.\n\nKANDIDATENS KOMPETENSER:\n${skills.join('\n')}\n\nKANDIDATENS ERFARENHETER:\n${_formatExperiences(experiences)}\n\nSTRUKTURERAT JOBB:\n${JSON.stringify(structuredJob, null, 2)}${seekerSection}`,
    { temperature: 0.2 },
  );
}

export async function matchPortrait(portraitText: string, jobText: string): Promise<MatchResult> {
  return _chatJSON<MatchResult>(
    _matchSystem(false),
    `Matcha kandidatporträttet mot jobbannonsen.\n\nKANDIDATSPORTRÄTT:\n${portraitText}\n\nJOBBANNONS:\n${jobText}`,
    { temperature: 0.2 },
  );
}

export async function suggestJobTitles(cvText: string): Promise<string[]> {
  const result = await _chatJSON<{ titles: string[] }>(
    'Du är en expert på yrkesroller och karriär. Returnera alltid giltig JSON utan förklaring.',
    `Utifrån detta CV, föreslå de 5 mest passande jobbtitlarna. Returnera JSON: { "titles": ["...", ...] }\n\n${cvText}`,
  );
  return result.titles ?? [];
}

// ── Candidate portrait ───────────────────────────────────────────────────────

export interface PortraitSkill {
  skill_name: string;
  category?: string;
  skill_level?: string;
}

export interface PortraitExperience {
  title: string;
  organization?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
  achievements?: string[];
}

export interface PortraitEducation {
  degree: string;
  field_of_study?: string | null;
  institution?: string | null;
  end_date?: string | null;
}

export interface PortraitCertification {
  name: string;
  issuer?: string | null;
  date?: string | null;
}

export interface PortraitCandidate {
  roles?: string | null;
  desired_city?: string | null;
  desired_employment?: string[];
  desired_workplace?: string[];
  willing_to_commute?: boolean;
  available_from?: string | null;
  description?: string | null;
  personal_qualities?: string[];
  skills?: PortraitSkill[];
  experiences?: PortraitExperience[];
  education?: PortraitEducation[];
  certifications?: PortraitCertification[];
}

export async function generatePortrait(candidate: PortraitCandidate): Promise<string> {
  const skillsByCategory: Record<string, string[]> = {};
  for (const s of candidate.skills ?? []) {
    const cat = s.category ?? 'Övrigt';
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat].push(s.skill_level ? `${s.skill_name} (${s.skill_level})` : s.skill_name);
  }
  const skillsText = Object.entries(skillsByCategory)
    .map(([cat, list]) => `${cat}: ${list.join(', ')}`)
    .join('\n') || '(inga kompetenser)';

  const expsText = (candidate.experiences ?? []).map(e => {
    const period = [e.start_date, e.is_current ? 'idag' : e.end_date].filter(Boolean).join('–');
    const lines = [`${e.title}${e.organization ? ' på ' + e.organization : ''}${period ? ' (' + period + ')' : ''}`];
    if (e.description) lines.push(e.description);
    if (e.achievements?.length) lines.push('Prestationer: ' + e.achievements.join('; '));
    return lines.join('\n');
  }).join('\n\n') || '(ingen erfarenhet)';

  const eduText = (candidate.education ?? []).map(e =>
    `${e.degree}${e.field_of_study ? ', ' + e.field_of_study : ''}${e.institution ? ' – ' + e.institution : ''}${e.end_date ? ' (' + e.end_date + ')' : ''}`
  ).join('\n') || '(ingen utbildning)';

  const certsText = (candidate.certifications ?? []).map(c =>
    `${c.name}${c.issuer ? ', ' + c.issuer : ''}${c.date ? ' (' + c.date + ')' : ''}`
  ).join('\n');

  const userPrompt = `Skriv ett professionellt kandidatportätt på svenska, 300–400 ord.

Regler:
- Skriv i tredje person — använd konsekvent "kandidaten" och "hen"/"hens"
- Avslöja aldrig kön, ålder eller personliga identifieringsuppgifter
- Nämn inga specifika årtal som avslöjar ålder — använd relativa termer ("mångårig erfarenhet", "över tio år")
- Inled med en mening som sammanfattar kandidatens profil och vad hen söker
- Väv in kompetenser och erfarenheter som löptext — inga punktlistor
- Lyft fram konkreta prestationer där sådana finns
- Avsluta med vad kandidaten söker: roll, ort, anställningsform och tillgänglighet
- Texten ska vara optimerad för semantisk matchning mot jobbannonser

--- KANDIDATDATA ---
Sökt roll/titel: ${candidate.roles ?? '(ej angivet)'}
Önskad ort: ${candidate.desired_city ?? '(ej angivet)'}
Anställningsform: ${(candidate.desired_employment ?? []).join(', ') || '(ej angivet)'}
Arbetsplats: ${(candidate.desired_workplace ?? []).join(', ') || '(ej angivet)'}
Kan pendla: ${candidate.willing_to_commute ? 'Ja' : 'Nej'}
Tillgänglig från: ${candidate.available_from ?? 'Omgående'}
Personlig beskrivning: ${candidate.description ?? '(ingen)'}
Personliga egenskaper: ${(candidate.personal_qualities ?? []).join(', ') || '(ej angivet)'}

KOMPETENSER:
${skillsText}

ARBETSLIVSERFARENHET:
${expsText}

UTBILDNING:
${eduText}${certsText ? '\n\nCERTIFIERINGAR:\n' + certsText : ''}`;

  return _chat(
    'Du är en erfaren rekryteringskonsult som skriver professionella kandidatportätt.',
    userPrompt,
    { temperature: 0.6 },
  );
}

// ── Window exposure for console debugging ────────────────────────────────────

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).cvAI = {
    structureCV,
    analyzeJob,
    matchJob,
    matchJobStructured,
    matchPortrait,
    suggestJobTitles,
    generatePortrait,
    chat: (system: string, user: string, opts?: ChatOpts) => _chat(system, user, opts),
  };
}
