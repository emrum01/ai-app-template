/**
 * UI Component Types
 */

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
}

export interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
}

export interface MusicGenerationFormData {
  prompt: string;
  style: string;
  model: string;
  instrumental: boolean;
  duration?: number;
}

export interface MusicGenerationFormProps {
  onSubmit: (data: MusicGenerationFormData) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface MusicTrackCardProps {
  track: import('./suno').MusicTrack;
  onPlay?: (track: import('./suno').MusicTrack) => void;
  onDownload?: (track: import('./suno').MusicTrack) => void;
  onExtend?: (track: import('./suno').MusicTrack) => void;
  className?: string;
}

export interface StyleSelectorProps {
  value: string;
  onChange: (style: string) => void;
  options: StyleOption[];
  className?: string;
}

export interface StyleOption {
  value: string;
  label: string;
  description?: string;
  category: 'genre' | 'mood' | 'instrument' | 'tempo';
}

export interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  className?: string;
}

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showCounter?: boolean;
  className?: string;
}

export interface GenerationHistoryProps {
  tracks: import('./suno').MusicTrack[];
  onTrackSelect?: (track: import('./suno').MusicTrack) => void;
  onTrackDelete?: (trackId: string) => void;
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}