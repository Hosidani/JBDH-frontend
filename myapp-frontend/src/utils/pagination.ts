export interface PaginationState {
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export function currentPage(p: PaginationState): number {
  return Math.floor(p.offset / p.limit) + 1;
}

export function totalPages(p: PaginationState): number {
  return Math.max(1, Math.ceil(p.total / p.limit));
}

export function showingRange(p: PaginationState, resultCount: number): { from: number; to: number } {
  return {
    from: p.offset + 1,
    to: Math.min(p.offset + resultCount, p.total),
  };
}
