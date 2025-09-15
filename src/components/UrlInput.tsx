import React, { memo, useCallback } from 'react';
import { combineUrl, isFullUrl, parseFullUrl } from '../utils/urlUtils';

interface UrlInputProps {
  baseUrl: string;
  path: string;
  onBaseUrlChange: (baseUrl: string, path?: string) => void;
  onPathChange: (path: string, baseUrl?: string) => void;
}

/**
 * URL Input Component with auto-separation functionality
 */
export const UrlInput = memo<UrlInputProps>(({ 
  baseUrl, 
  path, 
  onBaseUrlChange, 
  onPathChange 
}) => {
  const handleBaseUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Check if a full URL was pasted
    if (isFullUrl(inputValue)) {
      const { baseUrl: parsedBaseUrl, path: parsedPath } = parseFullUrl(inputValue);
      onBaseUrlChange(parsedBaseUrl, path || parsedPath);
    } else {
      onBaseUrlChange(inputValue);
    }
  }, [onBaseUrlChange, path]);

  const handlePathChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Check if a full URL was pasted in the path field
    if (isFullUrl(inputValue)) {
      const { baseUrl: parsedBaseUrl, path: parsedPath } = parseFullUrl(inputValue);
      onPathChange(parsedPath, baseUrl || parsedBaseUrl);
    } else {
      onPathChange(inputValue);
    }
  }, [onPathChange, baseUrl]);

  const fullUrl = combineUrl(baseUrl, path);

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
            💡 Tip: Paste a full URL here and it will automatically separate into base URL and path
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
            💡 You can also paste a full URL here
          </div>
        </div>
      </div>

      {/* Full URL Preview */}
      {fullUrl && (
        <div className="mb-3">
          <label className="form-label fw-bold">Full URL Preview:</label>
          <div className="url-preview" aria-live="polite">
            {fullUrl}
          </div>
        </div>
      )}
    </>
  );
});

UrlInput.displayName = 'UrlInput';
