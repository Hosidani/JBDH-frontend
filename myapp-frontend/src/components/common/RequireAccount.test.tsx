import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { TranslationProvider } from '../../hooks/TranslationProvider';
import { RequireAccount } from './RequireAccount';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockUser = { email: 'test@example.com', name: 'Test' };

const baseContext = {
  login: vi.fn(),
  logout: vi.fn(),
  sessionExpired: false,
  clearSessionExpired: vi.fn(),
  refreshRoles: vi.fn(),
};

function renderWithUser(user: typeof mockUser | null) {
  return render(
    <MemoryRouter initialEntries={['/', '/protected']} initialIndex={1}>
      <AuthContext.Provider value={{ ...baseContext, user }}>
        <TranslationProvider>
          <Routes>
            <Route path="/" element={<div>Hem</div>} />
            <Route path="/protected" element={<RequireAccount><div>Skyddad sida</div></RequireAccount>} />
          </Routes>
        </TranslationProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('RequireAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderar children när user finns', () => {
    renderWithUser(mockUser);
    expect(screen.getByText('Skyddad sida')).toBeInTheDocument();
  });

  it('renderar ingenting (null) när user saknas', () => {
    const { container } = renderWithUser(null);
    expect(screen.queryByText('Skyddad sida')).not.toBeInTheDocument();
    // returns null — container should be empty
    expect(container.querySelector('[data-protected]')).toBeNull();
  });

  it('navigerar tillbaka (-1) när user saknas och det finns historik', () => {
    Object.defineProperty(window, 'history', { writable: true, value: { length: 2 } });
    renderWithUser(null);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
    Object.defineProperty(window, 'history', { writable: true, value: { length: 1 } });
  });

  it('navigerar till / när user saknas och det inte finns historik', () => {
    Object.defineProperty(window, 'history', { writable: true, value: { length: 1 } });
    renderWithUser(null);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('dispatchar requireAccount-event när user saknas', () => {
    const listener = vi.fn();
    window.addEventListener('requireAccount', listener);
    renderWithUser(null);
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('requireAccount', listener);
  });

  it('dispatchar inte requireAccount-event när user finns', () => {
    const listener = vi.fn();
    window.addEventListener('requireAccount', listener);
    renderWithUser(mockUser);
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener('requireAccount', listener);
  });
});
