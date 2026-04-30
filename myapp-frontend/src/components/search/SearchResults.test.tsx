import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import { ApiService } from '../../services/ApiService';
import type { JobDetailsDto } from '../../services/ApiService';
import SearchResults from './SearchResults';

vi.mock('../../services/ApiService', () => ({
  ApiService: {
    saveJob: vi.fn().mockResolvedValue(undefined),
    unsaveJob: vi.fn().mockResolvedValue(undefined),
    createExternalJobAd: vi.fn().mockResolvedValue({ id: 88, name: '', text: '', created_at: '' }),
    markNotInterested: vi.fn().mockResolvedValue(undefined),
  },
}));

const baseJob: JobDetailsDto = {
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

describe('SearchResults – spara extern jobbannons vid bokmärkning', () => {
  beforeEach(() => vi.clearAllMocks());

  it('anropar createExternalJobAd med beskrivning och titel+ort', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchResults results={[baseJob]} onJobUpdate={vi.fn()} />);
    await user.click(await screen.findByTitle('Spara jobb'));
    await waitFor(() =>
      expect(ApiService.createExternalJobAd).toHaveBeenCalledWith(
        'Vi söker en skolkurator till vår skola.',
        'Skolkurator (Åmål)'
      )
    );
  });

  it('utelämnar ort ur titeln om den saknas', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchResults results={[{ ...baseJob, location: undefined }]} onJobUpdate={vi.fn()} />);
    await user.click(await screen.findByTitle('Spara jobb'));
    await waitFor(() =>
      expect(ApiService.createExternalJobAd).toHaveBeenCalledWith(
        'Vi söker en skolkurator till vår skola.',
        'Skolkurator'
      )
    );
  });

  it('anropar inte createExternalJobAd om beskrivning saknas', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchResults results={[{ ...baseJob, description: undefined }]} onJobUpdate={vi.fn()} />);
    await user.click(await screen.findByTitle('Spara jobb'));
    await waitFor(() => expect(ApiService.saveJob).toHaveBeenCalled());
    expect(ApiService.createExternalJobAd).not.toHaveBeenCalled();
  });

  it('anropar inte createExternalJobAd vid avbokmärkning', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchResults results={[{ ...baseJob, isSaved: true }]} onJobUpdate={vi.fn()} />);
    await user.click(await screen.findByTitle('Ta bort från sparade'));
    await waitFor(() => expect(ApiService.unsaveJob).toHaveBeenCalled());
    expect(ApiService.createExternalJobAd).not.toHaveBeenCalled();
  });
});
