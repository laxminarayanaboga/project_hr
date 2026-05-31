import {
  formatDate,
  formatTime,
  formatDateForApi,
  minutesToHoursLabel,
  getHoursWorked,
  weekBounds,
} from '../../src/utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats an ISO date string as dd MMM yyyy', () => {
      expect(formatDate('2025-06-15')).toBe('15 Jun 2025');
    });

    it('formats a Date object', () => {
      expect(formatDate(new Date(2025, 0, 1))).toBe('01 Jan 2025');
    });
  });

  describe('formatDateForApi', () => {
    it('returns yyyy-MM-dd', () => {
      expect(formatDateForApi(new Date(2025, 5, 15))).toBe('2025-06-15');
    });
  });

  describe('minutesToHoursLabel', () => {
    it('shows hours only when no remainder', () => {
      expect(minutesToHoursLabel(120)).toBe('2h');
    });

    it('shows hours and minutes', () => {
      expect(minutesToHoursLabel(150)).toBe('2h 30m');
    });

    it('handles zero', () => {
      expect(minutesToHoursLabel(0)).toBe('0h');
    });
  });

  describe('getHoursWorked', () => {
    it('returns label when both clock-in and clock-out provided', () => {
      const result = getHoursWorked('2025-06-15T09:00:00Z', '2025-06-15T17:30:00Z');
      expect(result).toBe('8h 30m');
    });
  });

  describe('weekBounds', () => {
    it('returns Monday as start of week', () => {
      const date = new Date(2025, 5, 18); // Wednesday 18 June 2025
      const {start} = weekBounds(date);
      expect(start).toBe('2025-06-16'); // Monday
    });

    it('returns Sunday as end of week', () => {
      const date = new Date(2025, 5, 18);
      const {end} = weekBounds(date);
      expect(end).toBe('2025-06-22'); // Sunday
    });
  });
});
