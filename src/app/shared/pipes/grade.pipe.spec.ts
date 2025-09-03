import { GradePipe } from './grade.pipe';

describe('GradePipe', () => {
  const pipe = new GradePipe();

  it('should return A/B/C with default thresholds 16/12', () => {
    expect(pipe.transform(18)).toBe('A');
    expect(pipe.transform(16)).toBe('A');
    expect(pipe.transform(15.99)).toBe('B');
    expect(pipe.transform(12)).toBe('B');
    expect(pipe.transform(11.99)).toBe('C');
    expect(pipe.transform(0)).toBe('C');
  });

  it('should handle custom thresholds', () => {
    expect(pipe.transform(15, 15, 10)).toBe('A');
    expect(pipe.transform(12, 15, 10)).toBe('B');
    expect(pipe.transform(9.5, 15, 10)).toBe('C');
  });

  it('should return "-" for invalid inputs', () => {
    expect(pipe.transform(NaN)).toBe('-');
    expect(pipe.transform(-1)).toBe('-');
    expect(pipe.transform(21)).toBe('-');
    expect(pipe.transform(undefined)).toBe('-');
    expect(pipe.transform(null)).toBe('-');
  });
});
