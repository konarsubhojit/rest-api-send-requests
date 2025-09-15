import React, { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setBaseUrl, setPath, updateParameter, addParameter } from '../store/slices/requestSlice';
import { combineUrl, isFullUrl, parseFullUrl } from '../utils/urlUtils';

/**
 * Redux-Connected URL Input Component
 * No prop drilling! Manages URL state directly through Redux
 * Follows SRP by focusing only on URL input concerns
 */
export const UrlInput = memo(() => {
  const dispatch = useAppDispatch();
  const { baseUrl, path, method, parameters } = useAppSelector(state => state.request);
  const handleBaseUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Check if a full URL was pasted
    if (isFullUrl(inputValue)) {
      const { baseUrl: parsedBaseUrl, path: parsedPath, parameters } = parseFullUrl(inputValue);
      dispatch(setBaseUrl(parsedBaseUrl));
      if (parsedPath) {
        dispatch(setPath(parsedPath));
      }
      // Handle parameters if provided
      if (parameters && parameters.length > 0) {
        parameters.forEach((param, index) => {
          if (index === 0) {
            // Update the first parameter slot
            dispatch(updateParameter({ index: 0, field: 'key', value: param.key }));
            dispatch(updateParameter({ index: 0, field: 'value', value: param.value }));
          } else {
            // Add new parameters
            dispatch(addParameter({ key: param.key, value: param.value }));
          }
        });
      }
    } else {
      dispatch(setBaseUrl(inputValue));
    }
  }, [dispatch]);

  const handlePathChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Check if a full URL was pasted in the path field
    if (isFullUrl(inputValue)) {
      const { baseUrl: parsedBaseUrl, path: parsedPath, parameters } = parseFullUrl(inputValue);
      if (parsedBaseUrl) {
        dispatch(setBaseUrl(parsedBaseUrl));
      }
      dispatch(setPath(parsedPath));
      // Handle parameters if provided
      if (parameters && parameters.length > 0) {
        parameters.forEach((param, index) => {
          if (index === 0) {
            // Update the first parameter slot
            dispatch(updateParameter({ index: 0, field: 'key', value: param.key }));
            dispatch(updateParameter({ index: 0, field: 'value', value: param.value }));
          } else {
            // Add new parameters
            dispatch(addParameter({ key: param.key, value: param.value }));
          }
        });
      }
    } else {
      dispatch(setPath(inputValue));
    }
  }, [dispatch]);

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
