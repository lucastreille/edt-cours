import { DurationAgoPipe } from './duration-ago.pipe';

describe('DurationAgoPipe', () => {
  const pipe = new DurationAgoPipe();

  it('should return dash for invalid', () => {
    expect(pipe.transform(NaN)).toBe('–');
    expect(pipe.transform(undefined)).toBe('–');
    expect(pipe.transform(null)).toBe('–');
    expect(pipe.transform('not a date')).toBe('–');
  });

  it('should handle "à l’instant"', () => {
    const now = Date.now();
    expect(pipe.transform(new Date(now - 2000))).toContain('instant');
  });

  it('should format minutes/hours/days', () => {
    expect(pipe.transform(new Date(Date.now() - 3 * 60 * 1000))).toBe('il y a 3 min'); // 3 min
    expect(pipe.transform(new Date(Date.now() - 2 * 60 * 60 * 1000))).toBe('il y a 2 h'); // 2 h
    expect(pipe.transform(new Date(Date.now() - 26 * 60 * 60 * 1000))).toBe('il y a 1 j'); // ~1.1 j
  });

  it('should say "hier" around ~1 day', () => {
    expect(pipe.transform(new Date(Date.now() - 24 * 60 * 60 * 1000))).toBe('hier');
  });

  it('should handle months/years', () => {
    expect(pipe.transform(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000))).toBe('il y a 1 mois');
    expect(pipe.transform(new Date(Date.now() - 400 * 24 * 60 * 60 * 1000))).toBe('il y a 1 an');
    expect(pipe.transform(new Date(Date.now() - 800 * 24 * 60 * 60 * 1000))).toBe('il y a 2 ans');
  });

  it('should handle future', () => {
    expect(pipe.transform(new Date(Date.now() + 5 * 60 * 1000))).toBe('dans 5 min'); // +5 min
  });
});
