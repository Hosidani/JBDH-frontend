import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TranslationProvider } from '../hooks/TranslationProvider';
import type { AuthUser } from '../context/AuthContext';

const mockAuthUser: AuthUser = { email: 'test@example.com', name: 'Test User' };

const mockAuthContext = {
  user: mockAuthUser,
  login: () => {},
  logout: () => {},
  sessionExpired: false,
  clearSessionExpired: () => {},
  refreshRoles: async () => {},
};

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}
