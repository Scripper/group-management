import { describe, it, expect } from 'vitest';
import {
  trimString,
  normalizeEmail,
  normalizeTag,
  normalizeTags,
} from '../normalize';

describe('trimString', () => {
  it('trims leading and trailing whitespace', () => {
    expect(trimString('  hello  ')).toBe('hello');
  });

  it('returns empty string for blank input', () => {
    expect(trimString('   ')).toBe('');
  });

  it('leaves already-trimmed strings unchanged', () => {
    expect(trimString('hello')).toBe('hello');
  });
});

describe('normalizeEmail', () => {
  it('trims and lowercases email', () => {
    expect(normalizeEmail('  Alice@Example.COM  ')).toBe('alice@example.com');
  });

  it('handles already-normalized email', () => {
    expect(normalizeEmail('bob@test.com')).toBe('bob@test.com');
  });

  it('returns empty string for blank input', () => {
    expect(normalizeEmail('   ')).toBe('');
  });
});

describe('normalizeTag', () => {
  it('trims and lowercases a tag', () => {
    expect(normalizeTag('  DevOps  ')).toBe('devops');
  });

  it('returns empty string for blank input', () => {
    expect(normalizeTag('   ')).toBe('');
  });
});

describe('normalizeTags', () => {
  it('normalizes and deduplicates tags', () => {
    expect(normalizeTags(['DevOps', ' devops ', 'QA'])).toEqual([
      'devops',
      'qa',
    ]);
  });

  it('removes empty/blank tags', () => {
    expect(normalizeTags(['', '  ', 'valid'])).toEqual(['valid']);
  });

  it('preserves order of first occurrence', () => {
    expect(normalizeTags(['B', 'A', 'b', 'a'])).toEqual(['b', 'a']);
  });

  it('returns empty array for empty input', () => {
    expect(normalizeTags([])).toEqual([]);
  });

  it('handles single tag', () => {
    expect(normalizeTags([' Engineering '])).toEqual(['engineering']);
  });
});

