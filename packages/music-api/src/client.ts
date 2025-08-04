/**
 * Suno API Client
 * Based on https://docs.sunoapi.org/
 */

import { SunoModel } from '@music-gen/shared';
import type {
  SunoConfig,
  MusicGenerationRequest,
  CustomMusicRequest,
  GenerationResponse,
  LyricsRequest,
  LyricsResponse,
  ExtendMusicRequest,
  MusicCoverRequest,
  StemSeparationRequest,
  AccountInfo
} from '@music-gen/shared';

export class SunoAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'SunoAPIError';
  }
}

export class SunoClient {
  private config: SunoConfig;

  constructor(config: SunoConfig) {
    this.config = {
      timeout: 30000,
      ...config
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new SunoAPIError(
          errorData.error?.code || 'http_error',
          errorData.error?.message || `HTTP ${response.status}`,
          response.status
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof SunoAPIError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new SunoAPIError('timeout', 'Request timed out');
      }
      
      throw new SunoAPIError('network_error', 'Network request failed');
    }
  }

  /**
   * Generate music from text prompt
   */
  async generateMusic(request: MusicGenerationRequest): Promise<GenerationResponse> {
    const payload = {
      prompt: request.prompt,
      style: request.style,
      model: request.model || SunoModel.V4,
      instrumental: request.instrumental || false,
      callback_url: request.callback_url,
    };

    return this.makeRequest<GenerationResponse>('audios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Generate custom music with specific lyrics
   */
  async generateCustomMusic(request: CustomMusicRequest): Promise<GenerationResponse> {
    const payload = {
      custom: true,
      lyric: request.lyrics,
      title: request.title,
      style: request.style,
      model: request.model || SunoModel.V4,
      callback_url: request.callback_url,
    };

    return this.makeRequest<GenerationResponse>('audios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get generation status and results
   */
  async getGenerationStatus(taskId: string): Promise<GenerationResponse> {
    return this.makeRequest<GenerationResponse>(`audios?generation_id=${taskId}`);
  }

  /**
   * Extend existing music
   */
  async extendMusic(request: ExtendMusicRequest): Promise<GenerationResponse> {
    const payload = {
      action: 'extend',
      audio_id: request.audio_id,
      continue_at: request.continue_at,
      lyrics: request.lyrics,
      style: request.style,
      model: request.model || SunoModel.V4,
    };

    return this.makeRequest<GenerationResponse>('audios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Create music cover
   */
  async createMusicCover(request: MusicCoverRequest): Promise<GenerationResponse> {
    const payload = {
      action: 'cover',
      audio_id: request.audio_id,
      lyric: request.lyrics,
      style: request.style,
      model: request.model || SunoModel.V4,
    };

    return this.makeRequest<GenerationResponse>('audios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Separate vocals and instruments
   */
  async separateStems(request: StemSeparationRequest): Promise<GenerationResponse> {
    const payload = {
      action: 'stems',
      audio_id: request.audio_id,
    };

    return this.makeRequest<GenerationResponse>('audios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Generate lyrics from prompt
   */
  async generateLyrics(request: LyricsRequest): Promise<LyricsResponse> {
    const payload = {
      prompt: request.prompt,
      callback_url: request.callback_url,
    };

    return this.makeRequest<LyricsResponse>('lyrics', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get account information and remaining credits
   */
  async getAccountInfo(): Promise<AccountInfo> {
    return this.makeRequest<AccountInfo>('account');
  }
}