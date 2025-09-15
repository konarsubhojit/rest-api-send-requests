import React, { memo, useCallback } from 'react';
import { combineUrl, isFullUrl, parseFullUrl } from '../utils/urlUtils';
import { HttpMethod, KeyValuePair } from '../types/api';

interface UrlInputProps {
  baseUrl: string;
  path: string;
  method?: HttpMethod;
  parameters?: KeyValuePair[];
  onBaseUrlChange: (baseUrl: string, path?: string, parameters?: Array<{ key: string; value: string }>) => void;
  onPathChange: (path: string, baseUrl?: string, parameters?: Array<{ key: string; value: string }>) => void;
}

/**
 * URL Input Component with auto-separation functionality
 */
export const UrlInput = memo<UrlInputProps>(({ 
  baseUrl, 
  path, 
  method = 'GET',
  parameters = [],
  onBaseUrlChange, 
  onPathChange 
}) => {
  const handleBaseUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Check if a full URL was pasted
    if (isFullUrl(inputValue)) {
      const { baseUrl: parsedBaseUrl, path: parsedPath, parameters } = parseFullUrl(inputValue);
      onBaseUrlChange(parsedBaseUrl, path || parsedPath, parameters);
    } else {
      onBaseUrlChange(inputValue);
    }
  }, [onBaseUrlChange, path]);

  const handlePathChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Check if a full URL was pasted in the path field
    if (isFullUrl(inputValue)) {
      const { baseUrl: parsedBaseUrl, path: parsedPath, parameters } = parseFullUrl(inputValue);
      onPathChange(parsedPath, baseUrl || parsedBaseUrl, parameters);
    } else {
      onPathChange(inputValue);
    }
  }, [onPathChange, baseUrl]);

  const fullUrl = combineUrl(baseUrl, path);

  // Build URL with parameters for GET requests
  const buildUrlWithParams = useCallback((url: string): string => {
    if (method !== 'GET' || !parameters.length || !url) return url;

    const validParams = parameters.filter(p => p.key.trim() && p.value.trim());
    if (validParams.length === 0) return url;

    try {
      const urlObj = new URL(url);
      validParams.forEach(param => {
        urlObj.searchParams.set(param.key, param.value);
      });
      return urlObj.toString();
    } catch {
      return url; // Return original URL if parsing fails
    }
  }, [method, parameters]);

  const urlWithParams = buildUrlWithParams(fullUrl);

  return (
    <>
      {/* URL Input Row */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-7">
          <label htmlFor="baseUrl" className="form-label fw-bold">Base URL:</label>
          <input
            id="baseUrl"
            type="url"
            value={baseUrl}
            onChange={handleBaseUrlChange}
            placeholder="https://api.example.com"
            className="form-control"
            aria-describedby="baseUrl-help"
          />
          <div id="baseUrl-help" className="form-text">
            💡 Paste a full URL here to auto-fill base URL, path, and parameters
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <label htmlFor="path" className="form-label fw-bold">Path:</label>
          <input
            id="path"
            type="text"
            value={path}
            onChange={handlePathChange}
            placeholder="/endpoint or /users/123"
            className="form-control"
            aria-describedby="path-help"
          />
          <div id="path-help" className="form-text">
            💡 You can also paste a full URL with parameters here
          </div>
        </div>
      </div>

      {/* Full URL Preview */}
      {fullUrl && (
        <div className="mb-3">
          <div className="form-label fw-bold">Full URL Preview:</div>
          <div className="url-preview" aria-live="polite">
            {urlWithParams}
          </div>
        </div>
      )}
    </>
  );
});

UrlInput.displayName = 'UrlInput';
