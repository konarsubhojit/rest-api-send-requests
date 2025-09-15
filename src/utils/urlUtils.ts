/**
 * URL utility functions for parsing and manipulating URLs
 */

export interface ParsedUrl {
  baseUrl: string;
  path: string;
  parameters: Array<{ key: string; value: string }>;
}

/**
 * Parse and separate full URL into base URL, path, and parameters
 */
export const parseFullUrl = (inputUrl: string): ParsedUrl => {
  try {
    const url = new URL(inputUrl.trim());
    const baseUrl = `${url.protocol}//${url.host}`;
    let path = url.pathname;
    
    // Clean up path - if it's just "/" make it empty
    if (path === '/') {
      path = '';
    }
    
    // Extract query parameters
    const parameters: Array<{ key: string; value: string }> = [];
    url.searchParams.forEach((value, key) => {
      parameters.push({ key, value });
    });
    
    // If there's a hash, add it to the path
    if (url.hash) {
      path += url.hash;
    }
    
    return { baseUrl, path, parameters };
  } catch {
    // If it's not a valid URL, return as is
    return { baseUrl: inputUrl, path: '', parameters: [] };
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
