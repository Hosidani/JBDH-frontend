import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LocalAccountContext } from '../../context/LocalAccountContext';
import { RequireLocalAccount } from './RequireLocalAccount';

function renderWith(hasLocalAccount: boolean | null) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <LocalAccountContext.Provider value={{ hasLocalAccount, localRoles: [], refreshLocalAccount: vi.fn() }}>
        <Routes>
          <Route path="/" element={<div>Hem</div>} />
          <Route
            path="/protected"
            element={<RequireLocalAccount><div>Skyddad sida</div></RequireLocalAccount>}
          />
        </Routes>
      </LocalAccountContext.Provider>
    </MemoryRouter>
  );
}

describe('RequireLocalAccount', () => {
  it('renderar ingenting när hasLocalAccount är null (laddar)', () => {
    const { container } = renderWith(null);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderar children när hasLocalAccount är true', () => {
    renderWith(true);
    expect(screen.getByText('Skyddad sida')).toBeInTheDocument();
  });

  it('navigerar till / när hasLocalAccount är false', () => {
    renderWith(false);
    expect(screen.getByText('Hem')).toBeInTheDocument();
    expect(screen.queryByText('Skyddad sida')).not.toBeInTheDocument();
  });
});
