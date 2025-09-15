import React, { memo } from 'react';
import { ApiResponse } from '../types/api';

interface ResponseDisplayProps {
  response: ApiResponse;
}

/**
 * Response Display Component for showing API response data
 */
export const ResponseDisplay = memo<ResponseDisplayProps>(({ response }) => {
  const isSuccess = response.status >= 200 && response.status < 300;

  return (
    <section className="response-section" aria-label="API Response">
      <div className="response-header">
        <h2 className="mb-0">Response</h2>
      </div>
      
      <div className="p-3 p-md-4">
        {/* Status */}
        <div className="mb-3">
          <span className={`status-badge ${isSuccess ? 'status-success' : 'status-error'}`}>
            {response.status} {response.statusText}
          </span>
        </div>

        {/* Error */}
        {response.error && (
          <div className="alert alert-danger error-alert" role="alert">
            <strong>Error:</strong> {response.error}
          </div>
        )}

        {/* Headers and Body in responsive layout */}
        <div className="row g-4">
          {/* Headers */}
          <div className="col-12 col-lg-6">
            <h3 className="h5 mb-3">Headers:</h3>
            <div className="response-headers">
              {JSON.stringify(response.headers, null, 2)}
            </div>
          </div>

          {/* Response Data */}
          <div className="col-12 col-lg-6">
            <h3 className="h5 mb-3">Response Body:</h3>
            <pre className="response-code mb-0" aria-label="Response body">
              {typeof response.data === 'string' 
                ? response.data 
                : JSON.stringify(response.data, null, 2)
              }
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
});

ResponseDisplay.displayName = 'ResponseDisplay';
