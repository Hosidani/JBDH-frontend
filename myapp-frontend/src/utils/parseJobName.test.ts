import { describe, it, expect } from 'vitest';
import { parseJobName, buildJobName } from './parseJobName';

describe('parseJobName', () => {
  it('parses all three fields', () => {
    expect(parseJobName('Backend Developer<>LinkedIn<>https://example.com')).toEqual({
      title: 'Backend Developer',
      channel: 'LinkedIn',
      url: 'https://example.com',
    });
  });

  it('parses title and channel without url', () => {
    expect(parseJobName('Backend Developer<>LinkedIn')).toEqual({
      title: 'Backend Developer',
      channel: 'LinkedIn',
      url: '',
    });
  });

  it('parses plain title with no separator', () => {
    expect(parseJobName('Backend Developer')).toEqual({
      title: 'Backend Developer',
      channel: '',
      url: '',
    });
  });

  it('handles empty string', () => {
    expect(parseJobName('')).toEqual({ title: '', channel: '', url: '' });
  });
});

describe('buildJobName', () => {
  it('returns only title when no channel or url', () => {
    expect(buildJobName('Backend Developer', '', '')).toBe('Backend Developer');
  });

  it('concatenates title and channel', () => {
    expect(buildJobName('Backend Developer', 'LinkedIn', '')).toBe('Backend Developer<>LinkedIn');
  });

  it('concatenates all three fields', () => {
    expect(buildJobName('Backend Developer', 'LinkedIn', 'https://example.com')).toBe(
      'Backend Developer<>LinkedIn<>https://example.com',
    );
  });
});
