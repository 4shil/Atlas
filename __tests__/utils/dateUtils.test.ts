import { getDaysUntil } from '../../src/utils/dateUtils';

describe('getDaysUntil', () => {
    it('returns positive days for future date', () => {
        const future = new Date();
        future.setDate(future.getDate() + 10);
        expect(getDaysUntil(future.toISOString())).toBeGreaterThan(0);
    });

    it('returns negative days for past date', () => {
        const past = new Date();
        past.setDate(past.getDate() - 5);
        expect(getDaysUntil(past.toISOString())).toBeLessThan(0);
    });

    it('returns 0 or 1 for today', () => {
        const today = new Date().toISOString();
        const result = getDaysUntil(today);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
    });
});
