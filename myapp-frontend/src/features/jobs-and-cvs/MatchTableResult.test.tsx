import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MatchTableResult, { type MatchRow } from './MatchTableResult';

const job1 = { id: 1, name: 'Backend Engineer' };
const job2 = { id: 2, name: 'Frontend Engineer' };
const cv1 = { id: 10, name: 'Anna Svensson' };
const cv2 = { id: 20, name: 'Beril Carlsson' };

const rows: MatchRow[] = [
  { job: job1, cv: cv1, score: 80 },
  { job: job2, cv: cv2, score: 50 },
  { job: job1, cv: cv2, score: 30 },
  { job: job2, cv: cv1, score: 90 },
];

function setup(r: MatchRow[] = rows) {
  const user = userEvent.setup();
  render(
    <MatchTableResult
      rows={r}
      jobLabel="Jobb"
      cvLabel="CV"
      scoreLabel="Poäng"
      emptyLabel="Inga resultat"
    />,
  );
  return { user };
}

function getRowTexts() {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map(row =>
      within(row).getAllByRole('cell').map(c => {
        const img = c.querySelector('img');
        return img ? (img.getAttribute('alt') ?? '') : (c.textContent ?? '');
      }),
    );
}

describe('MatchTableResult', () => {
  it('visar emptyLabel när rows är tom', () => {
    setup([]);
    expect(screen.getByText('Inga resultat')).toBeInTheDocument();
  });

  it('renderar en rad per MatchRow', () => {
    setup();
    const dataRows = screen.getAllByRole('row').slice(1);
    expect(dataRows).toHaveLength(rows.length);
  });

  it('formaterar score som procent', () => {
    setup([{ job: job1, cv: cv1, score: 75.6 }]);
    expect(screen.getByRole('row', { name: /76%/ })).toBeInTheDocument();
  });

  it('sorterar på score desc som standard', () => {
    setup();
    const scores = getRowTexts().map(cells => cells[2]);
    expect(scores).toEqual(['90%', '80%', '50%', '30%']);
  });

  it('klick på score-header byter till asc', async () => {
    const { user } = setup();
    await user.click(screen.getByText('Poäng'));
    const scores = getRowTexts().map(cells => cells[2]);
    expect(scores).toEqual(['30%', '50%', '80%', '90%']);
  });

  it('klick på score-header två gånger byter tillbaka till desc', async () => {
    const { user } = setup();
    await user.click(screen.getByText('Poäng'));
    await user.click(screen.getByText('Poäng'));
    const scores = getRowTexts().map(cells => cells[2]);
    expect(scores).toEqual(['90%', '80%', '50%', '30%']);
  });

  it('sorterar på jobb asc vid klick på Jobb-header', async () => {
    const { user } = setup();
    await user.click(screen.getByText('Jobb'));
    const jobs = getRowTexts().map(cells => cells[0]);
    expect(jobs[0]).toBe('Backend Engineer');
    expect(jobs[2]).toBe('Frontend Engineer');
  });

  it('sorterar på jobb desc vid andra klick på Jobb-header', async () => {
    const { user } = setup();
    await user.click(screen.getByText('Jobb'));
    await user.click(screen.getByText('Jobb'));
    const jobs = getRowTexts().map(cells => cells[0]);
    expect(jobs[0]).toBe('Frontend Engineer');
    expect(jobs[2]).toBe('Backend Engineer');
  });

  it('sorterar på cv asc vid klick på CV-header', async () => {
    const { user } = setup();
    await user.click(screen.getByText('CV'));
    const cvs = getRowTexts().map(cells => cells[1]);
    expect(cvs[0]).toBe('Anna Svensson');
    expect(cvs[2]).toBe('Beril Carlsson');
  });

  it('sekundär sortering på score desc vid jobb-sortering', async () => {
    const { user } = setup();
    await user.click(screen.getByText('Jobb'));
    const rows = getRowTexts();
    const backendRows = rows.filter(c => c[0] === 'Backend Engineer');
    expect(backendRows[0][2]).toBe('80%');
    expect(backendRows[1][2]).toBe('30%');
  });
});
