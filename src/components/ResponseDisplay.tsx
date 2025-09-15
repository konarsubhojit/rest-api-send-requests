import React, { memo, useState } from 'react';
import { ApiResponse } from '../types/api';

interface ResponseDisplayProps {
  response: ApiResponse;
  index?: number;
  isLatest?: boolean;
}

/**
 * Response Display Component for showing API response data
 */
export const ResponseDisplay = memo<ResponseDisplayProps>(({ response, index = 0, isLatest = false }) => {
  const isSuccess = response.status >= 200 && response.status < 300;
  const [headersCollapsed, setHeadersCollapsed] = useState(true);

  const downloadResponseAsJson = () => {
    const responseData = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      timestamp: response.timestamp || new Date().toISOString(),
      requestInfo: response.requestInfo
    };

    const jsonString = JSON.stringify(responseData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `api-response-${response.timestamp || Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Unknown time';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <section className={`response-section ${isLatest ? 'latest-response' : 'historical-response'}`} aria-label="API Response">
      <div className="response-header d-flex justify-content-between align-items-center">
        <div>
          <h3 className="mb-0">
            {isLatest ? 'Latest Response' : `Response #${index + 1}`}
            {response.requestInfo && (
              <small className="text-muted ms-2">
                {response.requestInfo.method} {response.requestInfo.url}
              </small>
            )}
          </h3>
          {response.timestamp && (
            <small className="text-muted">{formatTimestamp(response.timestamp)}</small>
          )}
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={downloadResponseAsJson}
          title="Download response as JSON file"
        >
          <svg
            width="16"
            height="16"
            fill="currentColor"
            className="me-1"
            viewBox="0 0 16 16"
          >
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
          </svg>
          Download JSON
        </button>
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

        {/* Headers and Body in vertical layout */}
        <div className="mb-4">
          {/* Headers */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0">
                Headers
                {Object.keys(response.headers).length > 0 && (
                  <span className="badge bg-secondary ms-2">
                    {Object.keys(response.headers).length}
                  </span>
                )}
              </h3>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                onClick={() => setHeadersCollapsed(!headersCollapsed)}
                aria-expanded={!headersCollapsed}
                aria-controls="headers-content"
                title={headersCollapsed ? "Expand headers" : "Collapse headers"}
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  className={`transition-transform ${headersCollapsed ? '' : 'rotate-90'}`}
                  viewBox="0 0 16 16"
                >
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                </svg>
                <span className="ms-1">
                  {headersCollapsed ? 'Show' : 'Hide'}
                </span>
              </button>
            </div>
            <div
              id="headers-content"
              className={`collapse ${!headersCollapsed ? 'show' : ''}`}
            >
              <div className="response-headers">
                {Object.keys(response.headers).length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" style={{ width: '30%' }}>Name</th>
                          <th scope="col">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(response.headers)
                          .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
                          .map(([key, value]) => (
                            <tr key={key}>
                              <td className="fw-medium text-muted">{key}</td>
                              <td className="font-monospace small" style={{ wordBreak: 'break-all' }}>
                                {value}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted fst-italic">No headers received</div>
                )}
              </div>
            </div>
          </div>

          {/* Response Data */}
          <div>
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
