import { describe, it, expect } from 'vitest';
import { currentPage, totalPages, showingRange } from './pagination';

const base = { total: 100, offset: 0, limit: 10, hasMore: true };

describe('currentPage', () => {
  it('returns 1 on first page', () => {
    expect(currentPage({ ...base, offset: 0 })).toBe(1);
  });

  it('returns 2 on second page', () => {
    expect(currentPage({ ...base, offset: 10 })).toBe(2);
  });

  it('returns correct page mid-set', () => {
    expect(currentPage({ ...base, offset: 50 })).toBe(6);
  });
});

describe('totalPages', () => {
  it('calculates pages evenly divisible', () => {
    expect(totalPages({ ...base, total: 100, limit: 10 })).toBe(10);
  });

  it('rounds up when items do not divide evenly', () => {
    expect(totalPages({ ...base, total: 101, limit: 10 })).toBe(11);
  });

  it('returns 1 when total is 0', () => {
    expect(totalPages({ ...base, total: 0 })).toBe(1);
  });
});

describe('showingRange', () => {
  it('returns correct range for first page', () => {
    expect(showingRange({ ...base, offset: 0 }, 10)).toEqual({ from: 1, to: 10 });
  });

  it('caps "to" at total on last partial page', () => {
    expect(showingRange({ ...base, total: 25, offset: 20 }, 5)).toEqual({ from: 21, to: 25 });
  });

  it('handles single result on last page', () => {
    expect(showingRange({ ...base, total: 21, offset: 20 }, 1)).toEqual({ from: 21, to: 21 });
  });
});
