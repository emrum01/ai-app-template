/**
 * Formatting utilities
 */

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) {
    return '0:00';
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) {
    return '0 B';
  }
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatTrackTitle(title: string, maxLength: number = 50): string {
  if (!title || typeof title !== 'string') {
    return 'Untitled Track';
  }
  
  const trimmedTitle = title.trim();
  if (trimmedTitle.length <= maxLength) {
    return trimmedTitle;
  }
  
  return `${trimmedTitle.substring(0, maxLength - 3)}...`;
}

export function formatCreatedAt(dateString: string): string {
  if (!dateString) {
    return 'Unknown date';
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid date';
  }
}