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
  const { container, ...rest } = renderWithProviders(<CompareCvToJobAdPage />);
  return { user, container, ...rest };
}

describe('External CVs – dropdown', () => {
  it('loads and shows saved CVs in dropdown', async () => {
    setup();
    const select = await screen.findByRole('combobox', { name: /sparad CV/i });
    for (const cv of externalCVs) {
      await waitFor(() => expect(select).toHaveTextContent(cv.text.slice(0, 60)));
    }
  });

  it('selecting a saved CV shows Ta bort button', async () => {
    const { user } = setup();
    const select = await screen.findByRole('combobox', { name: /sparad CV/i });
    await waitFor(() => expect(select).toHaveTextContent(externalCVs[0].text.slice(0, 60)));
    await user.selectOptions(select, String(externalCVs[0].id));
    expect(screen.getByRole('button', { name: /Ta bort/i })).toBeInTheDocument();
  });

  it('removes CV from dropdown after delete', async () => {
    const { user } = setup();
    const select = await screen.findByRole('combobox', { name: /sparad CV/i });
    await waitFor(() => expect(select).toHaveTextContent(externalCVs[0].text.slice(0, 60)));
    await user.selectOptions(select, String(externalCVs[0].id));
    await user.click(screen.getByRole('button', { name: /Ta bort/i }));
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: /sparad CV/i })).not.toHaveTextContent(
        externalCVs[0].text.slice(0, 60)
      )
    );
  });
});

describe('External CVs – PDF-uppladdning', () => {
  it('visar Spara CV-knapp när en fil väljs', async () => {
    const { user, container } = setup();
    await screen.findByRole('combobox', { name: /sparad CV/i });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const pdf = new File(['%PDF-content'], 'mitt-cv.pdf', { type: 'application/pdf' });
    await user.upload(fileInput, pdf);
    expect(await screen.findByRole('button', { name: /Spara CV/i })).toBeInTheDocument();
  });

  it('sparar PDF och lägger till i dropdown', async () => {
    const { user, container } = setup();
    await screen.findByRole('combobox', { name: /sparad CV/i });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const pdf = new File(['%PDF-content'], 'mitt-cv.pdf', { type: 'application/pdf' });
    await user.upload(fileInput, pdf);
    await user.click(await screen.findByRole('button', { name: /Spara CV/i }));
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: /sparad CV/i })).toHaveTextContent('Uppladdad CV-text via PDF')
    );
  });

  it('Spara CV-knapp döljs efter spara', async () => {
    const { user, container } = setup();
    await screen.findByRole('combobox', { name: /sparad CV/i });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const pdf = new File(['%PDF-content'], 'mitt-cv.pdf', { type: 'application/pdf' });
    await user.upload(fileInput, pdf);
    await user.click(await screen.findByRole('button', { name: /Spara CV/i }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /Spara CV/i })).not.toBeInTheDocument());
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
