import React, { useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectFullUrl, selectIsRequestValid } from '../store/slices/requestSlice';
import { useApiRequest } from '../hooks/useApiRequest';

/**
 * Action Buttons Component - Redux Connected
 * No prop drilling! Connects directly to Redux store
 * Follows SOLID principles by managing its own state dependencies
 */
export function ActionButtons() {
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
    </div>
  );
}
