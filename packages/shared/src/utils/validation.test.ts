import { describe, it, expect } from 'vitest';
import { validatePrompt, validateStyle, validateAudioUrl, validateTaskId } from './validation';

describe('validation utilities', () => {
  describe('validatePrompt', () => {
    it('should return true for valid prompts', () => {
      expect(validatePrompt('Create a happy song')).toBe(true);
      expect(validatePrompt('  A beautiful melody  ')).toBe(true);
      expect(validatePrompt('Rock music with electric guitar')).toBe(true);
    });

    it('should return false for invalid prompts', () => {
      expect(validatePrompt('')).toBe(false);
      expect(validatePrompt('ab')).toBe(false); // too short
      expect(validatePrompt('a'.repeat(501))).toBe(false); // too long
      expect(validatePrompt(null as any)).toBe(false);
      expect(validatePrompt(undefined as any)).toBe(false);
      expect(validatePrompt(123 as any)).toBe(false);
    });

    it('should handle whitespace correctly', () => {
      expect(validatePrompt('   ')).toBe(false);
      expect(validatePrompt('  a  ')).toBe(false); // too short after trim
      expect(validatePrompt('  abc  ')).toBe(true); // valid after trim
    });
  });

  describe('validateStyle', () => {
    it('should return true for valid styles', () => {
      expect(validateStyle('pop')).toBe(true);
      expect(validateStyle('rock, energetic')).toBe(true);
      expect(validateStyle('  jazz  ')).toBe(true);
    });

    it('should return false for invalid styles', () => {
      expect(validateStyle('')).toBe(false);
      expect(validateStyle('a')).toBe(false); // too short
      expect(validateStyle('a'.repeat(101))).toBe(false); // too long
      expect(validateStyle(null as any)).toBe(false);
      expect(validateStyle(undefined as any)).toBe(false);
    });
  });

  describe('validateAudioUrl', () => {
    it('should return true for valid URLs', () => {
      expect(validateAudioUrl('https://example.com/audio.mp3')).toBe(true);
      expect(validateAudioUrl('http://localhost:3000/song.wav')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(validateAudioUrl('')).toBe(false);
      expect(validateAudioUrl('not-a-url')).toBe(false);
      expect(validateAudioUrl('ftp://example.com/file.mp3')).toBe(false);
      expect(validateAudioUrl(null as any)).toBe(false);
      expect(validateAudioUrl(undefined as any)).toBe(false);
    });
  });

  describe('validateTaskId', () => {
    it('should return true for valid UUIDs', () => {
      expect(validateTaskId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(validateTaskId('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(validateTaskId('')).toBe(false);
      expect(validateTaskId('not-a-uuid')).toBe(false);
      expect(validateTaskId('123e4567-e89b-12d3-a456')).toBe(false); // too short
      expect(validateTaskId('123e4567-e89b-12d3-a456-42661417400x')).toBe(false); // invalid char
      expect(validateTaskId(null as any)).toBe(false);
      expect(validateTaskId(undefined as any)).toBe(false);
    });
  });
});