import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { TranslationProvider } from '../../hooks/TranslationProvider';
import { LocalAccountContext } from '../../context/LocalAccountContext';
import OnboardingPage from './OnboardingPage';

const { mockSaveAccount, mockAddCandidate, mockNavigate } = vi.hoisted(() => ({
  mockSaveAccount: vi.fn(),
  mockAddCandidate: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock('../../db/LocalDbService', () => ({
  LocalDbService: {
    saveAccount: mockSaveAccount,
    addCandidate: mockAddCandidate,
    getAccount: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockRefresh = vi.fn();

const baseAuthContext = {
  user: null, login: vi.fn(), logout: vi.fn(),
  sessionExpired: false, clearSessionExpired: vi.fn(), refreshRoles: vi.fn(),
};

function renderOnboarding() {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={baseAuthContext}>
        <TranslationProvider>
          <LocalAccountContext.Provider value={{ hasLocalAccount: false, hasBeAccount: false, localRoles: [], allAccounts: [], currentAccountId: undefined, refreshLocalAccount: mockRefresh }}>
            <OnboardingPage />
          </LocalAccountContext.Provider>
        </TranslationProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveAccount.mockResolvedValue({ account_id: 'acc-1', name: 'Alice', email: '', telephone: '', role: ['sökande'] });
    mockAddCandidate.mockResolvedValue({ candidate_id: 'cand-1' });
  });

  it('visar steg 0 initialt med namnfält', () => {
    renderOnboarding();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('Nästa-knappen är inaktiverad när name är tom', () => {
    renderOnboarding();
    expect(screen.getByTestId('btn-next')).toBeDisabled();
  });

  it('Nästa-knappen aktiveras när man skriver ett namn', () => {
    renderOnboarding();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } });
    expect(screen.getByTestId('btn-next')).not.toBeDisabled();
  });

  it('går vidare till steg 1 (användningstyp) och tillbaka', () => {
    renderOnboarding();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } });
    fireEvent.click(screen.getByTestId('btn-next'));

    // Steg 1: två radioknappar
    expect(screen.getAllByRole('radio')).toHaveLength(2);

    fireEvent.click(screen.getByTestId('btn-back'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('skapar konto och navigerar till / vid finish (user-flöde)', async () => {
    renderOnboarding();

    // Steg 0 — namn
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } });
    fireEvent.click(screen.getByTestId('btn-next'));

    // Steg 1 — välj jobb-sökare (radio[0])
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(screen.getByTestId('btn-next'));

    // Steg 2 — AI tips
    fireEvent.click(screen.getByTestId('btn-next'));

    // Steg 3 — finish
    fireEvent.click(screen.getByTestId('btn-finish'));

    await waitFor(() => {
      expect(mockSaveAccount).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alice' }));
      expect(mockAddCandidate).toHaveBeenCalledWith(expect.objectContaining({ is_own_candidate: true }));
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('skapar INTE kandidat vid manager-flöde', async () => {
    renderOnboarding();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByTestId('btn-next'));

    fireEvent.click(screen.getAllByRole('radio')[1]); // Manager
    fireEvent.click(screen.getByTestId('btn-next'));

    fireEvent.click(screen.getByTestId('btn-next'));

    fireEvent.click(screen.getByTestId('btn-finish'));

    await waitFor(() => {
      expect(mockSaveAccount).toHaveBeenCalled();
      expect(mockAddCandidate).not.toHaveBeenCalled();
    });
  });
});
