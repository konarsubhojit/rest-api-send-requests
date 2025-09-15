import React, { useState } from 'react';
import './App.css';

// TypeScript interfaces
interface KeyValuePair {
  key: string;
  value: string;
}

interface ApiRequest {
  url: string;
  method: string;
  authToken: string;
  parameters: KeyValuePair[];
}

interface ApiResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  error?: string;
}

// HTTP Methods
const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS'
];

function App() {
  const [request, setRequest] = useState<ApiRequest>({
    url: '',
    method: 'GET',
    authToken: '',
    parameters: [{ key: '', value: '' }]
  });
  
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequest(prev => ({ ...prev, url: e.target.value }));
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRequest(prev => ({ ...prev, method: e.target.value }));
  };

  const handleAuthTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequest(prev => ({ ...prev, authToken: e.target.value }));
  };

  // Handle parameter changes
  const handleParameterChange = (index: number, field: 'key' | 'value', value: string) => {
    const newParameters = [...request.parameters];
    newParameters[index][field] = value;
    setRequest(prev => ({ ...prev, parameters: newParameters }));
  };

  const addParameter = () => {
    setRequest(prev => ({
      ...prev,
      parameters: [...prev.parameters, { key: '', value: '' }]
    }));
  };

  const removeParameter = (index: number) => {
    if (request.parameters.length > 1) {
      const newParameters = request.parameters.filter((_, i) => i !== index);
      setRequest(prev => ({ ...prev, parameters: newParameters }));
    }
  };

  // Build URL with query parameters for GET requests
  const buildUrlWithParams = (url: string, params: KeyValuePair[]): string => {
    if (request.method !== 'GET' || params.length === 0) return url;
    
    const validParams = params.filter(p => p.key.trim() && p.value.trim());
    if (validParams.length === 0) return url;

    const urlObj = new URL(url);
    validParams.forEach(param => {
      urlObj.searchParams.set(param.key, param.value);
    });
    return urlObj.toString();
  };

  // Build request body for POST/PUT requests
  const buildRequestBody = (params: KeyValuePair[]): string | null => {
    if (request.method === 'GET' || request.method === 'HEAD') return null;
    
    const validParams = params.filter(p => p.key.trim() && p.value.trim());
    if (validParams.length === 0) return null;

    const body: Record<string, string> = {};
    validParams.forEach(param => {
      body[param.key] = param.value;
    });
    return JSON.stringify(body);
  };

  // Send API request
  const sendRequest = async () => {
    if (!request.url.trim()) {
      alert('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      // Build URL and headers
      const finalUrl = buildUrlWithParams(request.url, request.parameters);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (request.authToken.trim()) {
        headers['Authorization'] = `Bearer ${request.authToken}`;
      }

      // Build request options
      const requestOptions: RequestInit = {
        method: request.method,
        headers,
      };

      // Add body for non-GET requests
      const body = buildRequestBody(request.parameters);
      if (body) {
        requestOptions.body = body;
      }

      // Make the request
      const fetchResponse = await fetch(finalUrl, requestOptions);
      
      // Parse response
      let responseData;
      const contentType = fetchResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await fetchResponse.json();
      } else {
        responseData = await fetchResponse.text();
      }

      // Build response headers object
      const responseHeaders: Record<string, string> = {};
      fetchResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        data: responseData,
        headers: responseHeaders,
      });

    } catch (error: any) {
      setResponse({
        status: 0,
        statusText: 'Error',
        data: null,
        headers: {},
        error: error.message || 'An error occurred while making the request',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>API Request Tool</h1>
        
        {/* URL Input */}
        <div className="form-group">
          <label htmlFor="url">Endpoint URL:</label>
          <input
            id="url"
            type="text"
            value={request.url}
            onChange={handleUrlChange}
            placeholder="https://api.example.com/endpoint"
            className="form-control"
          />
        </div>

        {/* HTTP Method Dropdown */}
        <div className="form-group">
          <label htmlFor="method">HTTP Method:</label>
          <select
            id="method"
            value={request.method}
            onChange={handleMethodChange}
            className="form-control"
          >
            {HTTP_METHODS.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {/* Authorization Token */}
        <div className="form-group">
          <label htmlFor="auth">Authorization (Bearer Token):</label>
          <input
            id="auth"
            type="text"
            value={request.authToken}
            onChange={handleAuthTokenChange}
            placeholder="Enter your bearer token (optional)"
            className="form-control"
          />
        </div>

        {/* Parameters Section */}
        <div className="form-group">
          <label>
            Parameters 
            {request.method === 'GET' ? ' (URL Query Parameters)' : ' (JSON Body)'}:
          </label>
          {request.parameters.map((param, index) => (
            <div key={index} className="parameter-row">
              <input
                type="text"
                value={param.key}
                onChange={(e) => handleParameterChange(index, 'key', e.target.value)}
                placeholder="Key"
                className="param-input"
              />
              <input
                type="text"
                value={param.value}
                onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
                placeholder="Value"
                className="param-input"
              />
              <button
                type="button"
                onClick={() => removeParameter(index)}
                className="btn btn-remove"
                disabled={request.parameters.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addParameter} className="btn btn-add">
            Add Parameter
          </button>
        </div>

        {/* Send Request Button */}
        <div className="form-group">
          <button
            onClick={sendRequest}
            disabled={loading || !request.url.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>

        {/* Response Viewer */}
        {response && (
          <div className="response-section">
            <h2>Response</h2>
            
            {/* Status */}
            <div className="response-status">
              <span className={`status-code ${response.status >= 200 && response.status < 300 ? 'success' : 'error'}`}>
                {response.status} {response.statusText}
              </span>
            </div>

            {/* Error */}
            {response.error && (
              <div className="error-message">
                <strong>Error:</strong> {response.error}
              </div>
            )}

            {/* Headers */}
            <div className="response-headers">
              <h3>Headers:</h3>
              <pre>{JSON.stringify(response.headers, null, 2)}</pre>
            </div>

            {/* Response Data */}
            <div className="response-body">
              <h3>Response Body:</h3>
              <pre className="json-response">
                {typeof response.data === 'string' 
                  ? response.data 
                  : JSON.stringify(response.data, null, 2)
                }
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
