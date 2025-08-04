import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { SunoClient, SunoAPIError } from './client';
import { SunoModel, GenerationStatus } from '@music-gen/shared';

const BASE_URL = 'https://api.example.com';
const API_KEY = 'test-api-key';

describe('SunoClient', () => {
  let client: SunoClient;

  beforeEach(() => {
    client = new SunoClient({
      apiKey: API_KEY,
      baseUrl: BASE_URL,
      timeout: 5000,
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('generateMusic', () => {
    it('should generate music successfully', async () => {
      const mockResponse = {
        success: true,
        task_id: '123e4567-e89b-12d3-a456-426614174000',
        data: [
          {
            id: 'track-1',
            title: 'Happy Song',
            image_url: 'https://example.com/image.jpg',
            lyric: 'Happy lyrics here',
            audio_url: 'https://example.com/audio.mp3',
            video_url: 'https://example.com/video.mp4',
            created_at: '2024-01-01T00:00:00Z',
            model: 'chirp-v4',
            state: GenerationStatus.SUCCEEDED,
            style: 'pop, upbeat',
            duration: 120,
          },
        ],
      };

      nock(BASE_URL)
        .post('/audios', {
          prompt: 'Create a happy song',
          style: 'pop, upbeat',
          model: SunoModel.V4,
          instrumental: false,
        })
        .matchHeader('authorization', `Bearer ${API_KEY}`)
        .matchHeader('content-type', 'application/json')
        .reply(200, mockResponse);

      const result = await client.generateMusic({
        prompt: 'Create a happy song',
        style: 'pop, upbeat',
        model: SunoModel.V4,
        instrumental: false,
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      nock(BASE_URL)
        .post('/audios')
        .reply(400, {
          error: {
            code: 'bad_request',
            message: 'Invalid prompt',
          },
        });

      await expect(
        client.generateMusic({
          prompt: 'Invalid prompt',
        })
      ).rejects.toThrow(SunoAPIError);
    });

    it('should handle network errors', async () => {
      nock(BASE_URL)
        .post('/audios')
        .replyWithError('Network error');

      await expect(
        client.generateMusic({
          prompt: 'Test prompt',
        })
      ).rejects.toThrow(SunoAPIError);
    });

    it('should handle timeout', async () => {
      nock(BASE_URL)
        .post('/audios')
        .delay(6000) // Longer than timeout
        .reply(200, {});

      await expect(
        client.generateMusic({
          prompt: 'Test prompt',
        })
      ).rejects.toThrow('Request timed out');
    });

    it('should use default model when not specified', async () => {
      nock(BASE_URL)
        .post('/audios', (body) => {
          return body.model === SunoModel.V4;
        })
        .reply(200, { success: true });

      await client.generateMusic({
        prompt: 'Test prompt',
      });

      expect(nock.isDone()).toBe(true);
    });
  });

  describe('generateCustomMusic', () => {
    it('should generate custom music with lyrics', async () => {
      const mockResponse = {
        success: true,
        task_id: '456e7890-e89b-12d3-a456-426614174000',
      };

      nock(BASE_URL)
        .post('/audios', {
          custom: true,
          lyric: '[Verse]\nHappy lyrics here',
          title: 'My Custom Song',
          style: 'pop',
          model: SunoModel.V4,
        })
        .reply(200, mockResponse);

      const result = await client.generateCustomMusic({
        lyrics: '[Verse]\nHappy lyrics here',
        title: 'My Custom Song',
        style: 'pop',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getGenerationStatus', () => {
    it('should get generation status', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'track-1',
            title: 'Generated Song',
            state: GenerationStatus.SUCCEEDED,
          },
        ],
      };

      nock(BASE_URL)
        .get('/audios')
        .query({ generation_id: 'test-task-id' })
        .reply(200, mockResponse);

      const result = await client.getGenerationStatus('test-task-id');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('extendMusic', () => {
    it('should extend existing music', async () => {
      const mockResponse = {
        success: true,
        task_id: 'extend-task-id',
      };

      nock(BASE_URL)
        .post('/audios', {
          action: 'extend',
          audio_id: 'existing-audio-id',
          continue_at: 60,
          lyrics: 'Extended lyrics',
          style: 'rock',
          model: SunoModel.V4,
        })
        .reply(200, mockResponse);

      const result = await client.extendMusic({
        audio_id: 'existing-audio-id',
        continue_at: 60,
        lyrics: 'Extended lyrics',
        style: 'rock',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('createMusicCover', () => {
    it('should create music cover', async () => {
      const mockResponse = {
        success: true,
        task_id: 'cover-task-id',
      };

      nock(BASE_URL)
        .post('/audios', {
          action: 'cover',
          audio_id: 'original-audio-id',
          lyric: 'Cover lyrics',
          style: 'acoustic',
          model: SunoModel.V4,
        })
        .reply(200, mockResponse);

      const result = await client.createMusicCover({
        audio_id: 'original-audio-id',
        lyrics: 'Cover lyrics',
        style: 'acoustic',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('separateStems', () => {
    it('should separate vocals and instruments', async () => {
      const mockResponse = {
        success: true,
        task_id: 'stems-task-id',
      };

      nock(BASE_URL)
        .post('/audios', {
          action: 'stems',
          audio_id: 'source-audio-id',
        })
        .reply(200, mockResponse);

      const result = await client.separateStems({
        audio_id: 'source-audio-id',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateLyrics', () => {
    it('should generate lyrics', async () => {
      const mockResponse = {
        success: true,
        task_id: 'lyrics-task-id',
        data: {
          id: 'lyrics-1',
          lyrics: 'Generated lyrics here',
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      nock(BASE_URL)
        .post('/lyrics', {
          prompt: 'Write lyrics about friendship',
        })
        .reply(200, mockResponse);

      const result = await client.generateLyrics({
        prompt: 'Write lyrics about friendship',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAccountInfo', () => {
    it('should get account information', async () => {
      const mockResponse = {
        remaining_credits: 100,
        total_credits: 1000,
        usage_stats: {
          music_generations: 50,
          lyrics_generations: 25,
          audio_processing: 10,
        },
      };

      nock(BASE_URL)
        .get('/account')
        .reply(200, mockResponse);

      const result = await client.getAccountInfo();

      expect(result).toEqual(mockResponse);
    });
  });
});