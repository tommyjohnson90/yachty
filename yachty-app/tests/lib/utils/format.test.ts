import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDuration,
  formatPhoneNumber,
  formatFileSize,
  truncate,
  formatBoatLength,
  getInitials,
  formatPercentage,
} from '@/lib/utils/format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency with cents by default', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format currency without cents when specified', () => {
      expect(formatCurrency(1234.56, false)).toBe('$1,235');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-50.25)).toBe('-$50.25');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should handle decimal precision', () => {
      expect(formatCurrency(10.999)).toBe('$11.00');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string with default format', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
    });

    it('should format with custom format string', () => {
      expect(formatDate('2024-01-15', 'yyyy-MM-dd')).toBe('2024-01-15');
    });

    it('should format Date object', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = formatDate(date, 'MMM d, yyyy');
      expect(result).toMatch(/Jan 1[45], 2024/); // Account for timezone differences
    });

    it('should handle different format patterns', () => {
      expect(formatDate('2024-12-25', 'MMMM do, yyyy')).toBe('December 25th, 2024');
    });
  });

  describe('formatTime', () => {
    it('should format morning time', () => {
      expect(formatTime('09:30:00')).toBe('9:30 AM');
    });

    it('should format afternoon time', () => {
      expect(formatTime('14:45:00')).toBe('2:45 PM');
    });

    it('should format midnight', () => {
      expect(formatTime('00:00:00')).toBe('12:00 AM');
    });

    it('should format noon', () => {
      expect(formatTime('12:00:00')).toBe('12:00 PM');
    });

    it('should format 1 AM', () => {
      expect(formatTime('01:00:00')).toBe('1:00 AM');
    });

    it('should format 1 PM', () => {
      expect(formatTime('13:00:00')).toBe('1:00 PM');
    });
  });

  describe('formatDuration', () => {
    it('should format less than 1 hour in minutes', () => {
      expect(formatDuration(0.5)).toBe('30 min');
    });

    it('should format exactly 1 hour', () => {
      expect(formatDuration(1)).toBe('1 hr');
    });

    it('should format multiple whole hours', () => {
      expect(formatDuration(3)).toBe('3 hrs');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(2.5)).toBe('2h 30m');
    });

    it('should format hours and minutes with rounding', () => {
      expect(formatDuration(1.75)).toBe('1h 45m');
    });

    it('should handle very small durations', () => {
      expect(formatDuration(0.1)).toBe('6 min');
    });

    it('should round minutes to nearest integer', () => {
      expect(formatDuration(0.016)).toBe('1 min');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit number', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    });

    it('should format 11-digit number starting with 1', () => {
      expect(formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
    });

    it('should handle already formatted numbers', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
    });

    it('should handle numbers with dashes', () => {
      expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
    });

    it('should return original for invalid length', () => {
      expect(formatPhoneNumber('12345')).toBe('12345');
    });

    it('should strip non-digit characters before formatting', () => {
      expect(formatPhoneNumber('+1 (123) 456-7890')).toBe('+1 (123) 456-7890');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1234567)).toBe('1.18 MB');
    });
  });

  describe('truncate', () => {
    it('should not truncate short text', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('should truncate long text', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
    });

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    it('should add ellipsis for text over max', () => {
      expect(truncate('This is a long sentence', 10)).toBe('This is...');
    });

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('');
    });
  });

  describe('formatBoatLength', () => {
    it('should format boat length with feet symbol', () => {
      expect(formatBoatLength(42)).toBe("42'");
    });

    it('should handle decimal lengths', () => {
      expect(formatBoatLength(51.1)).toBe("51.1'");
    });

    it('should handle small boats', () => {
      expect(formatBoatLength(15)).toBe("15'");
    });
  });

  describe('getInitials', () => {
    it('should get initials from two-word name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should get initials from single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should get first two initials from multi-word name', () => {
      expect(getInitials('John Michael Doe')).toBe('JM');
    });

    it('should uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('should handle names with extra spaces', () => {
      expect(getInitials('John  Doe')).toBe('JD');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with no decimals by default', () => {
      expect(formatPercentage(0.08)).toBe('8%');
    });

    it('should format percentage with specified decimals', () => {
      expect(formatPercentage(0.08, 2)).toBe('8.00%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0%');
    });

    it('should handle 100%', () => {
      expect(formatPercentage(1)).toBe('100%');
    });

    it('should handle decimal precision', () => {
      expect(formatPercentage(0.0875, 2)).toBe('8.75%');
    });

    it('should handle values over 100%', () => {
      expect(formatPercentage(1.5)).toBe('150%');
    });
  });
});
