import { useState, useCallback } from 'react';
import { ApiRequest, ApiResponse, KeyValuePair } from '../types/api';
import { DEFAULT_HEADERS } from '../utils/constants';

/**
 * Custom hook for handling API requests
 */
export const useApiRequest = () => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Build URL with query parameters for GET requests
   */
  const buildUrlWithParams = useCallback((url: string, params: KeyValuePair[], method: string): string => {
    if (method !== 'GET' || params.length === 0) return url;
    
    const validParams = params.filter(p => p.key.trim() && p.value.trim());
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
  }, []);

  /**
   * Build request body for POST/PUT requests
   */
  const buildRequestBody = useCallback((params: KeyValuePair[], method: string): string | null => {
    if (method === 'GET' || method === 'HEAD') return null;
    
    const validParams = params.filter(p => p.key.trim() && p.value.trim());
    if (validParams.length === 0) return null;

    const body: Record<string, string> = {};
    validParams.forEach(param => {
      body[param.key] = param.value;
    });
    return JSON.stringify(body);
  }, []);

  /**
   * Send API request
   */
  const sendRequest = useCallback(async (request: ApiRequest, fullUrl: string) => {
    if (!fullUrl.trim()) {
      throw new Error('Please enter a valid URL');
    }

    setLoading(true);
    setResponse(null);

    try {
      // Build URL and headers
      const finalUrl = buildUrlWithParams(fullUrl, request.parameters, request.method);
      const headers: Record<string, string> = { ...DEFAULT_HEADERS };

      if (request.authToken.trim()) {
        headers['Authorization'] = `Bearer ${request.authToken}`;
      }

      // Build request options
      const requestOptions: RequestInit = {
        method: request.method,
        headers,
      };

      // Add body for non-GET requests
      const body = buildRequestBody(request.parameters, request.method);
      if (body) {
        requestOptions.body = body;
      }

      // Make the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const fetchResponse = await fetch(finalUrl, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      // Parse response
      let responseData;
      const contentType = fetchResponse.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await fetchResponse.json();
      } else {
        responseData = await fetchResponse.text();
      }

      // Build response headers object
      const responseHeaders: Record<string, string> = {};
      fetchResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const apiResponse: ApiResponse = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        data: responseData,
        headers: responseHeaders,
      };

      setResponse(apiResponse);
      return apiResponse;

    } catch (error: any) {
      const errorResponse: ApiResponse = {
        status: 0,
        statusText: 'Error',
        data: null,
        headers: {},
        error: error.name === 'AbortError' 
          ? 'Request timed out' 
          : error.message || 'An error occurred while making the request',
      };

      setResponse(errorResponse);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [buildUrlWithParams, buildRequestBody]);

  const clearResponse = useCallback(() => {
    setResponse(null);
  }, []);

  return {
    response,
    loading,
    sendRequest,
    clearResponse,
  };
};
