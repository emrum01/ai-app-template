import { describe, it, expect } from 'vitest';
import { formatDuration, formatFileSize, formatTrackTitle, formatCreatedAt } from './formatting';

describe('formatting utilities', () => {
  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(30)).toBe('0:30');
      expect(formatDuration(60)).toBe('1:00');
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(125)).toBe('2:05');
      expect(formatDuration(3661)).toBe('61:01'); // 1 hour 1 minute 1 second
    });

    it('should handle invalid input', () => {
      expect(formatDuration(-5)).toBe('0:00');
      expect(formatDuration(null as any)).toBe('0:00');
      expect(formatDuration(undefined as any)).toBe('0:00');
      expect(formatDuration(NaN)).toBe('0:00');
    });

    it('should pad seconds with zero', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(61)).toBe('1:01');
      expect(formatDuration(600)).toBe('10:00');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512.0 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(1073741824)).toBe('1.0 GB');
    });

    it('should handle invalid input', () => {
      expect(formatFileSize(-100)).toBe('0 B');
      expect(formatFileSize(null as any)).toBe('0 B');
      expect(formatFileSize(undefined as any)).toBe('0 B');
    });

    it('should round to one decimal place', () => {
      expect(formatFileSize(1234)).toBe('1.2 KB');
      expect(formatFileSize(1234567)).toBe('1.2 MB');
    });
  });

  describe('formatTrackTitle', () => {
    it('should return title as-is for short titles', () => {
      expect(formatTrackTitle('Short Title')).toBe('Short Title');
      expect(formatTrackTitle('A'.repeat(50))).toBe('A'.repeat(50));
    });

    it('should truncate long titles', () => {
      const longTitle = 'A'.repeat(60);
      const result = formatTrackTitle(longTitle);
      expect(result).toBe('A'.repeat(47) + '...');
      expect(result.length).toBe(50);
    });

    it('should handle custom max length', () => {
      const title = 'A long title that needs truncation';
      expect(formatTrackTitle(title, 10)).toBe('A long ...');
    });

    it('should handle invalid input', () => {
      expect(formatTrackTitle('')).toBe('Untitled Track');
      expect(formatTrackTitle(null as any)).toBe('Untitled Track');
      expect(formatTrackTitle(undefined as any)).toBe('Untitled Track');
    });

    it('should trim whitespace', () => {
      expect(formatTrackTitle('  Title  ')).toBe('Title');
    });
  });

  describe('formatCreatedAt', () => {
    it('should format valid date strings', () => {
      const result = formatCreatedAt('2024-01-15T10:30:00Z');
      expect(result).toMatch(/2024年1月15日/); // Japanese date format
    });

    it('should handle invalid input', () => {
      expect(formatCreatedAt('')).toBe('Unknown date');
      expect(formatCreatedAt('invalid-date')).toBe('Invalid date');
      expect(formatCreatedAt(null as any)).toBe('Unknown date');
      expect(formatCreatedAt(undefined as any)).toBe('Unknown date');
    });

    it('should format ISO date strings correctly', () => {
      const isoDate = '2024-12-25T15:45:30.123Z';
      const result = formatCreatedAt(isoDate);
      expect(result).toContain('2024');
      expect(result).toContain('12月');
      expect(result).toContain('25日');
    });
  });
});