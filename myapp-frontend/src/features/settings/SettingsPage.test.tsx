import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { TranslationProvider } from '../../hooks/TranslationProvider';
import { LocalAccountProvider } from '../../context/LocalAccountContext';
import SettingsPage from './SettingsPage';

const mocks = vi.hoisted(() => ({
  settingsGet: vi.fn().mockResolvedValue(undefined),
  settingsSet: vi.fn(),
  settingsDelete: vi.fn(),
  updateAccountSettings: vi.fn().mockResolvedValue({}),
  getAccount: vi.fn().mockResolvedValue(undefined),
  updateAccount: vi.fn(),
  getOwnCandidate: vi.fn().mockResolvedValue(undefined),
  addCandidate: vi.fn(),
}));

vi.mock('../../db/SettingsService', () => ({
  SettingsService: { get: mocks.settingsGet, set: mocks.settingsSet, delete: mocks.settingsDelete },
}));
vi.mock('../../services/ApiService', () => ({
  ApiService: { updateAccountSettings: mocks.updateAccountSettings },
}));
vi.mock('../../db/LocalDbService', () => ({
  LocalDbService: {
    getAccount: mocks.getAccount,
    updateAccount: mocks.updateAccount,
    getOwnCandidate: mocks.getOwnCandidate,
    addCandidate: mocks.addCandidate,
  },
}));

const baseContext = {
  login: vi.fn(), logout: vi.fn(),
  sessionExpired: false, clearSessionExpired: vi.fn(), refreshRoles: vi.fn(),
};

function renderPage(user: any = null) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ ...baseContext, user }}>
        <LocalAccountProvider>
          <TranslationProvider>
            <SettingsPage />
          </TranslationProvider>
        </LocalAccountProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('SettingsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.settingsGet.mockResolvedValue(undefined); });

  it('visar AI-inställningar och språksektion', () => {
    renderPage(null);
    expect(screen.getByText('ai_settings_title')).toBeInTheDocument();
    expect(screen.getByText('account_language')).toBeInTheDocument();
  });

  it('visar roller-sektionen alltid', () => {
    renderPage(null);
    expect(screen.getByText('account_roles')).toBeInTheDocument();
  });

  it('sparar roll lokalt i IDB när ej inloggad och roll klickas', async () => {
    renderPage(null);
    await act(async () => {
      fireEvent.click(screen.getAllByRole('checkbox', { hidden: true })[0].closest('label')!);
    });
    expect(mocks.updateAccount).toHaveBeenCalledWith({ role: ['sökande'] });
  });

  it('sparar roller via ApiService när inloggad och roll klickas', async () => {
    renderPage({ email: 'a@b.com', roles: [] });
    await act(async () => {
      fireEvent.click(screen.getAllByRole('checkbox', { hidden: true })[0].closest('label')!);
    });
    expect(mocks.updateAccountSettings).toHaveBeenCalledWith({ updateRoles: ['User'] });
  });

  it('visar providerknapparna', () => {
    renderPage(null);
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('Google Gemini')).toBeInTheDocument();
  });

  it('sparar provider direkt vid klick', async () => {
    renderPage(null);
    await act(async () => { fireEvent.click(screen.getByText('Anthropic')); });
    expect(mocks.settingsSet).toHaveBeenCalledWith('ai_provider', 'anthropic');
  });

  it('byter till Ollama och sparar URL på blur', async () => {
    renderPage(null);
    await act(async () => { fireEvent.click(screen.getByText('Ollama (lokal)')); });
    const urlInput = await screen.findByTestId('ollama-url-input');
    fireEvent.change(urlInput, { target: { value: 'http://localhost:11434' } });
    await act(async () => { fireEvent.blur(urlInput); });
    expect(mocks.settingsSet).toHaveBeenCalledWith('ollama_url', 'http://localhost:11434');
  });
});
