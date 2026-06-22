import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { AuthContext } from '../../context/AuthContext';
import { TranslationProvider } from '../../hooks/TranslationProvider';
import { RequireAccount } from './RequireAccount';

const mockUser = { email: 'test@example.com', name: 'Test' };

const baseContext = {
  login: vi.fn(),
  logout: vi.fn(),
  sessionExpired: false,
  clearSessionExpired: vi.fn(),
  refreshRoles: vi.fn(),
};

function renderWithUser(user: typeof mockUser | null, initialPath = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
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

  it('navigerar till / när user saknas', () => {
    renderWithUser(null);
    expect(screen.getByText('Hem')).toBeInTheDocument();
    expect(screen.queryByText('Skyddad sida')).not.toBeInTheDocument();
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
