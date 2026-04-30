import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NamePill, getInitials, getPillColor } from './NamePill';

describe('getInitials', () => {
  it('returnerar initialer från två ord', () => {
    expect(getInitials('Henrik Carlsson (Fullstack)')).toBe('HC');
  });

  it('returnerar en bokstav för ett ord', () => {
    expect(getInitials('Anna')).toBe('A');
  });

  it('är versaler', () => {
    expect(getInitials('adam bertilsson')).toBe('AB');
  });

  it('hanterar extra mellanslag', () => {
    expect(getInitials('  Lena  Exström  ')).toBe('LE');
  });
});

describe('getPillColor', () => {
  it('returnerar samma färg för samma id', () => {
    expect(getPillColor(3)).toEqual(getPillColor(3));
  });

  it('roterar färger för id > palettlängd', () => {
    expect(getPillColor(0)).toEqual(getPillColor(12));
  });
});

describe('NamePill', () => {
  it('renderar rätt initialer', () => {
    render(<NamePill id={1} title="Beril Carlsson (CI/CD)" />);
    expect(screen.getByText('BC')).toBeInTheDocument();
  });

  it('visar title som tooltip', () => {
    render(<NamePill id={2} title="Carl Davidsson" />);
    expect(screen.getByTitle('Carl Davidsson')).toBeInTheDocument();
  });

  it('är klickbar när onClick skickas', () => {
    const onClick = vi.fn();
    render(<NamePill id={1} title="Test Person" onClick={onClick} />);
    screen.getByText('TP').click();
    expect(onClick).toHaveBeenCalled();
  });
});
