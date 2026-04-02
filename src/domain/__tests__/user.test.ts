import { describe, it, expect } from 'vitest';
import { fullName } from '../user';

describe('fullName', () => {
  it('combines first and last name', () => {
    expect(fullName({ firstName: 'Alice', lastName: 'Johnson' })).toBe('Alice Johnson');
  });

  it('trims the result when last name is empty', () => {
    expect(fullName({ firstName: 'Alice', lastName: '' })).toBe('Alice');
  });

  it('trims the result when first name is empty', () => {
    expect(fullName({ firstName: '', lastName: 'Johnson' })).toBe('Johnson');
  });

  it('returns empty string when both names are empty', () => {
    expect(fullName({ firstName: '', lastName: '' })).toBe('');
  });

  it('handles whitespace-only names', () => {
    expect(fullName({ firstName: '  ', lastName: '  ' })).toBe('');
  });
});

