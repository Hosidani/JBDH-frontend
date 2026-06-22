import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { TranslationProvider } from '../../../hooks/TranslationProvider';
import AccountRequiredModal from './AccountRequiredModal';

const baseContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  sessionExpired: false,
  clearSessionExpired: vi.fn(),
  refreshRoles: vi.fn(),
};

function renderModal(onClose = vi.fn()) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={baseContext}>
        <TranslationProvider>
          <AccountRequiredModal onClose={onClose} />
        </TranslationProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

// Note: TranslationProvider returns raw i18n keys in test env
describe('AccountRequiredModal', () => {
  it('visar titel, body och knappar', () => {
    renderModal();
    expect(screen.getByText('account_required_title')).toBeInTheDocument();
    expect(screen.getByText('account_required_body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'account_required_create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'account_required_login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'account_required_close' })).toBeInTheDocument();
  });

  it('anropar onClose vid klick på stäng-knappen', () => {
    const onClose = vi.fn();
    renderModal(onClose);
    fireEvent.click(screen.getByRole('button', { name: 'account_required_close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('anropar onClose vid klick på bakgrunden', () => {
    const onClose = vi.fn();
    const { container } = renderModal(onClose);
    fireEvent.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dispatchar requireLogin-event vid klick på logga in-knappen', () => {
    const listener = vi.fn();
    window.addEventListener('requireLogin', listener);
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'account_required_login' }));
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('requireLogin', listener);
  });
});
