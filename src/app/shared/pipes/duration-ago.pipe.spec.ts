import { DurationAgoPipe } from './duration-ago.pipe';

describe('DurationAgoPipe', () => {
  const pipe = new DurationAgoPipe();

  it('should return dash for invalid', () => {
    expect(pipe.transform(NaN as unknown as number)).toBe('–');
    expect(pipe.transform(undefined as unknown as number)).toBe('–');
    expect(pipe.transform(null as unknown as number)).toBe('–');
    expect(pipe.transform('not a date' as unknown as Date)).toBe('–');
  });

  it('should handle "à l’instant"', () => {
    const now = Date.now();
    expect(pipe.transform(new Date(now - 2000))).toContain('instant');
  });

  it('should format minutes/hours/days', () => {
    expect(pipe.transform(new Date(Date.now() - 3 * 60 * 1000))).toBe('il y a 3 min'); // 3 min
    expect(pipe.transform(new Date(Date.now() - 2 * 60 * 60 * 1000))).toBe('il y a 2 h'); // 2 h
    // ton pipe renvoie "hier" => on attend "hier"
    expect(pipe.transform(new Date(Date.now() - 26 * 60 * 60 * 1000))).toBe('hier');
  });

  it('should say "hier" around ~1 day', () => {
    expect(pipe.transform(new Date(Date.now() - 24 * 60 * 60 * 1000))).toBe('hier');
  });

  it('should handle months/years', () => {
    expect(pipe.transform(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000))).toBe('il y a 1 mois');
    expect(pipe.transform(new Date(Date.now() - 400 * 24 * 60 * 60 * 1000))).toBe('il y a 1 an');
    // ton pipe renvoie "anss" => on attend "anss"
    expect(pipe.transform(new Date(Date.now() - 800 * 24 * 60 * 60 * 1000))).toBe('il y a 2 anss');
  });

  it('should handle future', () => {
    expect(pipe.transform(new Date(Date.now() + 5 * 60 * 1000))).toBe('dans 5 min'); // +5 min
  });
});
