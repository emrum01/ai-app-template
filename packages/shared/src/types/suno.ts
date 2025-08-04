/**
 * Suno API Types
 * Based on https://docs.sunoapi.org/
 */

export enum SunoModel {
  V3_5 = 'chirp-v3.5',
  V4 = 'chirp-v4', 
  V4_5 = 'chirp-v4.5'
}

export enum GenerationStatus {
  PENDING = 'pending',
  RUNNING = 'running', 
  SUCCEEDED = 'succeeded',
  ERROR = 'error'
}

export interface SunoConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

export interface MusicGenerationRequest {
  prompt: string;
  style?: string;
  model?: SunoModel;
  instrumental?: boolean;
  callback_url?: string;
}

export interface CustomMusicRequest {
  lyrics: string;
  title: string;
  style?: string;
  model?: SunoModel;
  callback_url?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  image_url: string;
  lyric: string;
  audio_url: string;
  video_url: string;
  created_at: string;
  model: string;
  state: GenerationStatus;
  style: string;
  duration: number;
}

export interface GenerationResponse {
  success: boolean;
  task_id?: string;
  data?: MusicTrack[];
  error?: {
    code: string;
    message: string;
  };
}

export interface LyricsRequest {
  prompt: string;
  callback_url?: string;
}

export interface LyricsResponse {
  success: boolean;
  task_id?: string;
  data?: {
    id: string;
    lyrics: string;
    created_at: string;
  };
}

export interface ExtendMusicRequest {
  audio_id: string;
  continue_at: number;
  lyrics?: string;
  style?: string;
  model?: SunoModel;
}

export interface MusicCoverRequest {
  audio_id: string;
  lyrics: string;
  style: string;
  model?: SunoModel;
}

export interface StemSeparationRequest {
  audio_id: string;
}

export interface AccountInfo {
  remaining_credits: number;
  total_credits: number;
  usage_stats: {
    music_generations: number;
    lyrics_generations: number;
    audio_processing: number;
  };
}