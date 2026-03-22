import { formatCurrency, truncate, capitalise, sleep } from '../index';

describe('formatCurrency', () => {
  it('formats NGN by default', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('1,000');
    expect(result).toContain('₦');
  });

  it('formats USD when specified', () => {
    const result = formatCurrency(1234.56, 'USD', 'en-US');
    expect(result).toContain('1,234.56');
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });
});

describe('truncate', () => {
  it('does not truncate short strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates long strings with ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('truncates at exact boundary', () => {
    expect(truncate('hello', 5)).toBe('hello');
    expect(truncate('hello!', 5)).toBe('he...');
  });
});

describe('capitalise', () => {
  it('capitalises the first letter', () => {
    expect(capitalise('hello')).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(capitalise('')).toBe('');
  });

  it('handles already capitalised string', () => {
    expect(capitalise('Hello')).toBe('Hello');
  });
});

describe('sleep', () => {
  it('resolves after the given delay', async () => {
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(45);
  });
});
