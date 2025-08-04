/**
 * Validation utilities
 */

export function validatePrompt(prompt: string): boolean {
  if (!prompt || typeof prompt !== 'string') {
    return false;
  }
  
  const trimmedPrompt = prompt.trim();
  return trimmedPrompt.length >= 3 && trimmedPrompt.length <= 500;
}

export function validateStyle(style: string): boolean {
  if (!style || typeof style !== 'string') {
    return false;
  }
  
  const trimmedStyle = style.trim();
  return trimmedStyle.length >= 2 && trimmedStyle.length <= 100;
}

export function validateAudioUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateTaskId(taskId: string): boolean {
  if (!taskId || typeof taskId !== 'string') {
    return false;
  }
  
  // UUID pattern validation
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(taskId);
}