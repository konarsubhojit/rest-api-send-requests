import React, { useState, useCallback } from 'react';
import './App.css';

// Components
import { UrlInput } from './components/UrlInput';
import { AuthTokenInput } from './components/AuthTokenInput';
import { ParametersInput } from './components/ParametersInput';
import { ResponseDisplay } from './components/ResponseDisplay';

// Types and utilities
import { ApiRequest, HttpMethod } from './types/api';
import { HTTP_METHODS } from './utils/constants';
import { combineUrl } from './utils/urlUtils';
import { useApiRequest } from './hooks/useApiRequest';

/**
 * Main API Request Tool Application
 */
function App() {
  const [request, setRequest] = useState<ApiRequest>({
    baseUrl: '',
    path: '',
    method: 'GET',
    authToken: '',
    parameters: [{ id: crypto.randomUUID(), key: '', value: '' }]
  });

  const { response, loading, sendRequest, clearResponse } = useApiRequest();

  // URL change handlers
  const handleBaseUrlChange = useCallback((baseUrl: string, path?: string) => {
    setRequest(prev => ({
      ...prev,
      baseUrl,
      ...(path !== undefined && { path })
    }));
  }, []);

  const handlePathChange = useCallback((path: string, baseUrl?: string) => {
    setRequest(prev => ({
      ...prev,
      path,
      ...(baseUrl !== undefined && { baseUrl })
    }));
  }, []);

  // Other handlers
  const handleMethodChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRequest(prev => ({ ...prev, method: e.target.value as HttpMethod }));
    clearResponse(); // Clear response when method changes
  }, [clearResponse]);

  const handleAuthTokenChange = useCallback((authToken: string) => {
    setRequest(prev => ({ ...prev, authToken }));
  }, []);

  // Parameter handlers
  const handleParameterChange = useCallback((index: number, field: 'key' | 'value', value: string) => {
    setRequest(prev => {
      const newParameters = [...prev.parameters];
      newParameters[index][field] = value;
      return { ...prev, parameters: newParameters };
    });
  }, []);

  const handleAddParameter = useCallback(() => {
    setRequest(prev => ({
      ...prev,
      parameters: [...prev.parameters, { id: crypto.randomUUID(), key: '', value: '' }]
    }));
  }, []);

  const handleRemoveParameter = useCallback((index: number) => {
    setRequest(prev => {
      if (prev.parameters.length > 1) {
        const newParameters = prev.parameters.filter((_, i) => i !== index);
        return { ...prev, parameters: newParameters };
      }
      return prev;
    });
  }, []);

  // Send request handler
  const handleSendRequest = useCallback(async () => {
    const fullUrl = combineUrl(request.baseUrl, request.path);

    if (!fullUrl.trim()) {
      alert('Please enter a valid base URL');
      return;
    }

    try {
      await sendRequest(request, fullUrl);
    } catch (error) {
      // Error is already handled in the hook
      console.error('Request failed:', error);
    }
  }, [request, sendRequest]);

  const fullUrl = combineUrl(request.baseUrl, request.path);
  const isRequestValid = fullUrl.trim().length > 0;

  return (
    <div className="App">
      <div className="container-fluid px-3 px-sm-4">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="main-container p-3 p-md-4 p-lg-5">
              <header className="text-center mb-4 mb-md-5">
                <h1 className="display-4 display-md-3">API Request Tool</h1>
              </header>

              <main>
                {/* URL Input */}
                <div className="mb-4">
                  <UrlInput
                    baseUrl={request.baseUrl}
                    path={request.path}
                    onBaseUrlChange={handleBaseUrlChange}
                    onPathChange={handlePathChange}
                  />
                </div>

                {/* HTTP Method and Auth Token Row */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label htmlFor="method" className="form-label fw-bold">HTTP Method:</label>
                    <select
                      id="method"
                      value={request.method}
                      onChange={handleMethodChange}
                      className="form-select"
                      aria-describedby="method-help"
                    >
                      {HTTP_METHODS.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                    <div id="method-help" className="form-text">
                      Choose the HTTP method for your request
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <AuthTokenInput
                      authToken={request.authToken}
                      onAuthTokenChange={handleAuthTokenChange}
                    />
                  </div>
                </div>

                {/* Parameters Section */}
                <div className="mb-4">
                  <ParametersInput
                    parameters={request.parameters}
                    method={request.method}
                    onParameterChange={handleParameterChange}
                    onAddParameter={handleAddParameter}
                    onRemoveParameter={handleRemoveParameter}
                  />
                </div>

                {/* Send Request Button */}
                <div className="d-grid gap-2 mb-4">
                  <button
                    onClick={handleSendRequest}
                    disabled={loading || !isRequestValid}
                    className="btn btn-primary btn-lg btn-send-request"
                    aria-describedby="send-help"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm loading-spinner me-2" aria-hidden="true"></span>
                        <span className="visually-hidden">Loading...</span>
                        {'Sending Request...'}
                      </>
                    ) : (
                      'Send Request'
                    )}
                  </button>
                  {!isRequestValid && (
                    <div id="send-help" className="text-muted text-center">
                      Please enter a valid URL to send the request
                    </div>
                  )}
                </div>

                {/* Response Viewer */}
                {response && (
                  <div className="mt-4">
                    <ResponseDisplay response={response} />
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
