import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import SelectableListSection from './SelectableListSection';

const items = [
  { id: 1, name: 'Anna Svensson (Frontend)' },
  { id: 2, name: 'Beril Carlsson (CI/CD)' },
  { id: 3, name: 'Carl Davidsson (Embedded)' },
];

function setup(selected = new Set<number>(), onSelectionChange = vi.fn()) {
  const user = userEvent.setup();
  renderWithProviders(
    <SelectableListSection
      title="Sparade CV"
      items={items}
      selected={selected}
      onSelectionChange={onSelectionChange}
      onAdd={vi.fn()}
      onDelete={vi.fn()}
      addLabel="Lägg till CV"
      deleteLabel="Ta bort CV"
      selectAllLabel="Alla CV"
      emptyLabel="Inga sparade"
    />
  );
  return { user, onSelectionChange };
}

describe('SelectableListSection', () => {
  it('renderar alla items', () => {
    setup();
    expect(screen.getByText('Anna Svensson (Frontend)')).toBeInTheDocument();
    expect(screen.getByText('Beril Carlsson (CI/CD)')).toBeInTheDocument();
    expect(screen.getByText('Carl Davidsson (Embedded)')).toBeInTheDocument();
  });

  it('väljer ett item vid klick', async () => {
    const onSelectionChange = vi.fn();
    const { user } = setup(new Set(), onSelectionChange);
    await user.click(screen.getByLabelText('Anna Svensson (Frontend)') ?? screen.getAllByRole('checkbox')[1]);
    expect(onSelectionChange).toHaveBeenCalledWith(new Set([1]));
  });

  it('"Alla CV" väljer alla items', async () => {
    const onSelectionChange = vi.fn();
    const { user } = setup(new Set(), onSelectionChange);
    await user.click(screen.getByRole('checkbox', { name: /Alla CV/i }));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set([1, 2, 3]));
  });

  it('"Alla CV" avmarkerar alla om alla är valda', async () => {
    const onSelectionChange = vi.fn();
    const { user } = setup(new Set([1, 2, 3]), onSelectionChange);
    await user.click(screen.getByRole('checkbox', { name: /Alla CV/i }));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set());
  });

  it('"Ta bort CV"-knappen är inaktiv när inget är valt', () => {
    setup(new Set());
    expect(screen.getByRole('button', { name: /Ta bort CV/i })).toBeDisabled();
  });

  it('"Ta bort CV"-knappen är aktiv när något är valt', () => {
    setup(new Set([1]));
    expect(screen.getByRole('button', { name: /Ta bort CV/i })).not.toBeDisabled();
  });
});
