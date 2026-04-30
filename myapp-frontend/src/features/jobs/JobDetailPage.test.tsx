import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { TranslationProvider } from '../../hooks/TranslationProvider';
import { ApiService } from '../../services/ApiService';
import JobDetailPage from './JobDetailPage';

vi.mock('../../services/ApiService', () => ({
  ApiService: {
    getJobDetails: vi.fn(),
    saveJob: vi.fn().mockResolvedValue(undefined),
    unsaveJob: vi.fn().mockResolvedValue(undefined),
    createExternalJobAd: vi.fn().mockResolvedValue({ id: 88, name: '', text: '', created_at: '' }),
    markNotInterested: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockJob = {
  jobId: 1,
  title: 'Skolkurator',
  description: 'Vi söker en skolkurator till vår skola.',
  location: 'Åmål',
  isSaved: false,
  hasApplied: false,
  isNotInterested: false,
  requiredSkills: [],
  requiredSoftSkills: [],
};

const mockAuth = {
  user: { email: 'test@example.com', name: 'Test' },
  login: () => {},
  logout: () => {},
  sessionExpired: false,
  clearSessionExpired: () => {},
  refreshRoles: async () => {},
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/job/1']}>
      <AuthContext.Provider value={mockAuth}>
        <TranslationProvider>
          <Routes>
            <Route path="/job/:id" element={<JobDetailPage />} />
          </Routes>
        </TranslationProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('JobDetailPage – spara extern jobbannons vid bokmärkning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ApiService.getJobDetails).mockResolvedValue(mockJob);
  });

  it('anropar createExternalJobAd med beskrivning och titel+ort', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: /spara/i }));
    await waitFor(() =>
      expect(ApiService.createExternalJobAd).toHaveBeenCalledWith(
        'Vi söker en skolkurator till vår skola.',
        'Skolkurator (Åmål)'
      )
    );
  });

  it('utelämnar ort ur titeln om den saknas', async () => {
    vi.mocked(ApiService.getJobDetails).mockResolvedValue({ ...mockJob, location: undefined });
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: /spara/i }));
    await waitFor(() =>
      expect(ApiService.createExternalJobAd).toHaveBeenCalledWith(
        'Vi söker en skolkurator till vår skola.',
        'Skolkurator'
      )
    );
  });

  it('anropar inte createExternalJobAd om beskrivning saknas', async () => {
    vi.mocked(ApiService.getJobDetails).mockResolvedValue({ ...mockJob, description: undefined });
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: /spara/i }));
    await waitFor(() => expect(ApiService.saveJob).toHaveBeenCalled());
    expect(ApiService.createExternalJobAd).not.toHaveBeenCalled();
  });

  it('anropar inte createExternalJobAd vid avbokmärkning', async () => {
    vi.mocked(ApiService.getJobDetails).mockResolvedValue({ ...mockJob, isSaved: true });
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: /spara/i }));
    await waitFor(() => expect(ApiService.unsaveJob).toHaveBeenCalled());
    expect(ApiService.createExternalJobAd).not.toHaveBeenCalled();
  });
});
