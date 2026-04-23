import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost/api';

export const externalCVs = [
  { id: 1, text: 'Erfaren Python-utvecklare med 5 års erfarenhet.', created_at: '2026-04-23T10:00:00Z' },
  { id: 2, text: 'Frontend-specialist med React och TypeScript.', created_at: '2026-04-23T11:00:00Z' },
];

export const externalJobAds = [
  { id: 1, text: 'Vi söker en senior backend-utvecklare till vårt team.', created_at: '2026-04-23T10:00:00Z' },
];

export const handlers = [
  // Auth token refresh (suppress warnings)
  http.post(`${BASE}/auth/refresh/`, () => HttpResponse.json({ access: 'new-token' })),

  // Account settings (used by TranslationProvider to load language preference)
  http.get(`${BASE}/settings/getaccountsettings`, () => HttpResponse.json({ preferredLanguage: 'sv' })),

  // External CVs
  http.get(`${BASE}/external-cvs/`, () => HttpResponse.json(externalCVs)),

  http.post(`${BASE}/external-cvs/`, async ({ request }) => {
    const body = await request.json() as { text: string };
    return HttpResponse.json({ id: 99, text: body.text, created_at: '2026-04-23T12:00:00Z' }, { status: 201 });
  }),

  http.delete(`${BASE}/external-cvs/:id/`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${BASE}/external-cvs/upload-pdf/`, () =>
    HttpResponse.json({ id: 99, text: 'Uppladdad CV-text via PDF', created_at: '2026-04-23T12:00:00Z' }, { status: 201 })
  ),

  // External Job Ads
  http.get(`${BASE}/external-job-ads/`, () => HttpResponse.json(externalJobAds)),

  http.post(`${BASE}/external-job-ads/`, async ({ request }) => {
    const body = await request.json() as { text: string };
    return HttpResponse.json({ id: 88, text: body.text, created_at: '2026-04-23T12:00:00Z' }, { status: 201 });
  }),

  http.delete(`${BASE}/external-job-ads/:id/`, () => new HttpResponse(null, { status: 204 })),
];
