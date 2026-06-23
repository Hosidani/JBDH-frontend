import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LocalAccountProvider, useLocalAccountContext } from './LocalAccountContext';

const { mockGetAccount, mockGetAllAccounts } = vi.hoisted(() => ({
  mockGetAccount: vi.fn(),
  mockGetAllAccounts: vi.fn().mockResolvedValue([]),
}));

vi.mock('../db/LocalDbService', () => ({
  LocalDbService: {
    getAccount: mockGetAccount,
    getAllAccounts: mockGetAllAccounts,
    saveAccount: vi.fn(),
    addCandidate: vi.fn(),
  },
}));

function TestConsumer() {
  const { hasLocalAccount, localRoles, refreshLocalAccount } = useLocalAccountContext();
  return (
    <div>
      <span data-testid="status">{String(hasLocalAccount)}</span>
      <span data-testid="roles">{localRoles.join(',')}</span>
      <button onClick={refreshLocalAccount}>refresh</button>
    </div>
  );
}

describe('LocalAccountContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with null (loading) and resolves to true when account exists', async () => {
    mockGetAccount.mockResolvedValue({ account_id: '1', name: 'Alice', role: ['sökande'] });
    render(
      <LocalAccountProvider>
        <TestConsumer />
      </LocalAccountProvider>
    );
    expect(screen.getByTestId('status').textContent).toBe('null');
    await act(async () => {});
    expect(screen.getByTestId('status').textContent).toBe('true');
  });

  it('resolves to false when no account exists', async () => {
    mockGetAccount.mockResolvedValue(undefined);
    render(
      <LocalAccountProvider>
        <TestConsumer />
      </LocalAccountProvider>
    );
    await act(async () => {});
    expect(screen.getByTestId('status').textContent).toBe('false');
  });

  it('exposes localRoles in backend format for a sökande account', async () => {
    mockGetAccount.mockResolvedValue({ account_id: '1', name: 'Alice', role: ['sökande'] });
    render(
      <LocalAccountProvider>
        <TestConsumer />
      </LocalAccountProvider>
    );
    await act(async () => {});
    expect(screen.getByTestId('roles').textContent).toBe('User');
  });

  it('exposes localRoles in backend format for a säljare account', async () => {
    mockGetAccount.mockResolvedValue({ account_id: '1', name: 'Bob', role: ['säljare'] });
    render(
      <LocalAccountProvider>
        <TestConsumer />
      </LocalAccountProvider>
    );
    await act(async () => {});
    expect(screen.getByTestId('roles').textContent).toBe('Manager');
  });

  it('localRoles is empty when no account', async () => {
    mockGetAccount.mockResolvedValue(undefined);
    render(
      <LocalAccountProvider>
        <TestConsumer />
      </LocalAccountProvider>
    );
    await act(async () => {});
    expect(screen.getByTestId('roles').textContent).toBe('');
  });

  it('refreshLocalAccount re-reads the database', async () => {
    mockGetAccount
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ account_id: '1', name: 'Alice', role: ['sökande'] });
    render(
      <LocalAccountProvider>
        <TestConsumer />
      </LocalAccountProvider>
    );
    await act(async () => {});
    expect(screen.getByTestId('status').textContent).toBe('false');

    await act(async () => {
      screen.getByText('refresh').click();
    });
    expect(screen.getByTestId('status').textContent).toBe('true');
    expect(screen.getByTestId('roles').textContent).toBe('User');
  });

  it('sätter hasLocalAccount till false vid DB-fel så att redirect kan triggas', async () => {
    mockGetAccount.mockRejectedValue(new Error('IDBDatabase error'));
    render(
      <LocalAccountProvider>
        <TestConsumer />
      </LocalAccountProvider>
    );
    await act(async () => {});
    expect(screen.getByTestId('status').textContent).toBe('false');
    expect(screen.getByTestId('roles').textContent).toBe('');
  });

  it('throws when used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    spy.mockRestore();
  });
});
