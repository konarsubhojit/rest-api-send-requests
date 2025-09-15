import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectFullUrl,
  selectIsRequestValid,
  setBaseUrl,
  setPath,
  setMethod,
  updateHeader,
  addHeader,
  updateParameter,
  addParameter,
  setBodyType,
  setBodyContent,
  setAuthToken
} from '../store/slices/requestSlice';
import { useApiRequest } from '../hooks/useApiRequest';
import { CurlUtils } from '../utils/curlUtils';
import { parseFullUrl } from '../utils/urlUtils';

/**
 * Action Buttons Component - Redux Connected
 * No prop drilling! Connects directly to Redux store
 * Follows SOLID principles by managing its own state dependencies
 */
export function ActionButtons() {
  const dispatch = useAppDispatch();
  const request = useAppSelector(state => state.request);
  const fullUrl = useAppSelector(selectFullUrl);
  const isRequestValid = useAppSelector(selectIsRequestValid);
  
  const { loading, sendRequest } = useApiRequest();

  const handleSendRequest = useCallback(async () => {
    if (!fullUrl.trim()) {
      alert('Please enter a valid base URL');
      return;
    }

    try {
      await sendRequest(request, fullUrl);
    } catch (error) {
      console.error('Request failed:', error);
    }
  }, [request, fullUrl, sendRequest]);

  const handleExportCurl = useCallback(() => {
    try {
      const curlCommand = CurlUtils.apiRequestToCurl(request, fullUrl);

      // Copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(curlCommand).then(() => {
          alert('cURL command copied to clipboard!');
        }).catch(() => {
          // Fallback: show in alert for user to copy manually
          alert(`cURL command:\n\n${curlCommand}`);
        });
      } else {
        // Fallback: show in alert for user to copy manually
        alert(`cURL command:\n\n${curlCommand}`);
      }
    } catch (error) {
      console.error('Failed to export cURL:', error);
      alert('Failed to export cURL command');
    }
  }, [request, fullUrl]);

  const handleImportCurl = useCallback(() => {
    const curlCommand = prompt('Paste your cURL command here:');
    if (!curlCommand?.trim()) return;

    try {
      const { apiRequest, fullUrl: parsedUrl } = CurlUtils.curlToApiRequest(curlCommand);

      // Update Redux state with parsed data
      const { baseUrl, path, parameters } = parseFullUrl(parsedUrl);
      dispatch(setBaseUrl(baseUrl));
      dispatch(setPath(path));
      dispatch(setMethod(apiRequest.method));
      dispatch(setBodyType(apiRequest.bodyType));
      dispatch(setBodyContent(apiRequest.bodyContent));
      dispatch(setAuthToken(apiRequest.authToken));

      // Update headers (replace existing ones)
      apiRequest.headers.forEach((header, index) => {
        if (index === 0) {
          dispatch(updateHeader({ index: 0, field: 'key', value: header.key }));
          dispatch(updateHeader({ index: 0, field: 'value', value: header.value }));
        } else {
          dispatch(addHeader({ key: header.key, value: header.value }));
        }
      });

      // Update parameters (replace existing ones)  
      apiRequest.parameters.forEach((param, index) => {
        if (index === 0) {
          dispatch(updateParameter({ index: 0, field: 'key', value: param.key }));
          dispatch(updateParameter({ index: 0, field: 'value', value: param.value }));
        } else {
          dispatch(addParameter({ key: param.key, value: param.value }));
        }
      });

      // Also add any parameters parsed from the URL
      parameters.forEach((param, index) => {
        // If this is the first URL parameter and we haven't added any cURL parameters yet,
        // update the first slot, otherwise add new parameters
        const shouldUpdateFirst = index === 0 && apiRequest.parameters.length === 0;
        if (shouldUpdateFirst) {
          dispatch(updateParameter({ index: 0, field: 'key', value: param.key }));
          dispatch(updateParameter({ index: 0, field: 'value', value: param.value }));
        } else {
          dispatch(addParameter({ key: param.key, value: param.value }));
        }
      });

      alert('cURL command imported successfully!');
    } catch (error) {
      console.error('Failed to import cURL:', error);
      alert('Failed to parse cURL command. Please check the format.');
    }
  }, [dispatch]);

  return (
    <div className="d-flex flex-wrap gap-2 mb-4">
      <button
        onClick={handleSendRequest}
        disabled={!isRequestValid || loading}
        className="btn btn-primary"
        type="button"
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Sending...
          </>
        ) : (
          <>
            <i className="bi bi-send me-1" aria-hidden="true"></i>
            Send Request
          </>
        )}
      </button>

      <button
        onClick={handleExportCurl}
        disabled={!isRequestValid}
        className="btn btn-outline-secondary"
        type="button"
      >
        <i className="bi bi-download me-1" aria-hidden="true"></i>
        Export cURL
      </button>

      <button
        onClick={handleImportCurl}
        className="btn btn-outline-secondary"
        type="button"
      >
        <i className="bi bi-upload me-1" aria-hidden="true"></i>
        Import cURL
      </button>
    </div>
  );
}
