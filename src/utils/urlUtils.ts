/**
 * URL utility functions for parsing and manipulating URLs
 */

export interface ParsedUrl {
  baseUrl: string;
  path: string;
}

/**
 * Parse and separate full URL into base URL and path
 */
export const parseFullUrl = (inputUrl: string): ParsedUrl => {
  try {
    const url = new URL(inputUrl.trim());
    const baseUrl = `${url.protocol}//${url.host}`;
    let path = url.pathname + url.search + url.hash;
    
    // Clean up path - if it's just "/" make it empty
    if (path === '/') {
      path = '';
    }
    
    return { baseUrl, path };
  } catch {
    // If it's not a valid URL, return as is
    return { baseUrl: inputUrl, path: '' };
  }
};

/**
 * Check if the input looks like a full URL
 */
export const isFullUrl = (input: string): boolean => {
  const trimmed = input.trim();
  // More robust URL detection
  try {
    new URL(trimmed);
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  } catch {
    return false;
  }
};

/**
 * Combine base URL and path safely
 */
export const combineUrl = (baseUrl: string, path: string): string => {
  const cleanBaseUrl = baseUrl.trim();
  const cleanPath = path.trim();

  if (!cleanBaseUrl) return '';

  // Remove trailing slash from base URL and leading slash from path for proper concatenation
  const finalBaseUrl = cleanBaseUrl.replace(/\/$/, '');
  const finalPath = cleanPath.replace(/^\//, '');

  return finalPath ? `${finalBaseUrl}/${finalPath}` : finalBaseUrl;
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
