import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/msw/server';
import { externalCVs, externalJobAds } from '../../test/msw/handlers';
import CompareCvToJobAdPage from './CompareCvToJobAdPage';

vi.mock('../../hooks/useSSE', () => ({
  useSSE: () => {},
}));

function setup() {
  const user = userEvent.setup();
  const view = renderWithProviders(<CompareCvToJobAdPage />);
  return { user, ...view };
}

describe('SavedTextPanel - External CVs', () => {
  it('loads and shows saved CVs in dropdown', async () => {
    setup();
    const select = await screen.findByRole('combobox', { name: /sparad CV/i });
    for (const cv of externalCVs) {
      await waitFor(() => expect(select).toHaveTextContent(cv.text.slice(0, 60)));
    }
  });

  it('fills CV textarea on select', async () => {
    const { user } = setup();
    const select = await screen.findByRole('combobox', { name: /sparad CV/i });
    await user.selectOptions(select, String(externalCVs[0].id));
    const textarea = screen.getByPlaceholderText(/CV-inneh/i) as HTMLTextAreaElement;
    await waitFor(() => expect(textarea.value).toBe(externalCVs[0].text));
  });

  it('saves new CV and adds to dropdown', async () => {
    const { user } = setup();
    await screen.findByRole('combobox', { name: /sparad CV/i });
    const textarea = screen.getByPlaceholderText(/CV-inneh/i) as HTMLTextAreaElement;
    await user.clear(textarea);
    await user.type(textarea, 'Nytt CV');
    await user.click(screen.getByRole('button', { name: /Spara CV/i }));
    await waitFor(() => expect(screen.getByRole('combobox', { name: /sparad CV/i })).toHaveTextContent('Nytt CV'));
  });

  it('removes CV from dropdown after delete', async () => {
    const { user } = setup();
    const select = await screen.findByRole('combobox', { name: /sparad CV/i });
    await user.selectOptions(select, String(externalCVs[0].id));
    await user.click(await screen.findByRole('button', { name: /Ta bort/i }));
    await waitFor(() => expect(screen.getByRole('combobox', { name: /sparad CV/i })).not.toHaveTextContent(externalCVs[0].text.slice(0, 60)));
  });
});

describe('SavedTextPanel - External Job Ads', () => {
  it('loads and shows saved job ads in dropdown', async () => {
    setup();
    const select = await screen.findByRole('combobox', { name: /sparad jobbannons/i });
    await waitFor(() => expect(select).toHaveTextContent(externalJobAds[0].text.slice(0, 60)));
  });

  it('fills job ad textarea on select', async () => {
    const { user } = setup();
    const select = await screen.findByRole('combobox', { name: /sparad jobbannons/i });
    await user.selectOptions(select, String(externalJobAds[0].id));
    const textarea = await screen.findByPlaceholderText(/jobbannonsens text/i) as HTMLTextAreaElement;
    await waitFor(() => expect(textarea.value).toBe(externalJobAds[0].text));
  });

  it('saves new job ad and adds to dropdown', async () => {
    const { user } = setup();
    await screen.findByRole('combobox', { name: /sparad jobbannons/i });
    const textarea = await screen.findByPlaceholderText(/jobbannonsens text/i) as HTMLTextAreaElement;
    await user.clear(textarea);
    await user.type(textarea, 'Ny annons');
    await user.click(screen.getByRole('button', { name: /Spara jobbannons/i }));
    await waitFor(() => expect(screen.getByRole('combobox', { name: /sparad jobbannons/i })).toHaveTextContent('Ny annons'));
  });
});

describe('API error resilience', () => {
  it('still renders if external-cvs API fails', async () => {
    server.use(http.get('*/external-cvs/', () => HttpResponse.json({}, { status: 500 })));
    setup();
    await waitFor(() => expect(screen.getByRole('combobox', { name: /sparad jobbannons/i })).toBeInTheDocument());
  });
});
