import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiRequest, ApiResponse, SavedRequest } from '../../types/api';
import { RequestStorageService } from '../../utils/requestStorage';
import { combineUrl } from '../../utils/urlUtils';

// Async thunk for sending API requests
export const sendApiRequest = createAsyncThunk<
  ApiResponse,
  { request: ApiRequest; fullUrl: string },
  { rejectValue: string }
>(
  'request/sendApiRequest',
  async ({ request, fullUrl }, { rejectWithValue }) => {
    try {
      // Prepare request configuration
      const config: RequestInit = {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(
            request.headers
              .filter(h => h.key.trim() && h.value.trim())
              .map(h => [h.key, h.value])
          )
        }
      };

      // Add authorization header if token exists
      if (request.authToken.trim()) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${request.authToken}`
        };
      }

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && request.bodyContent.trim()) {
        if (request.bodyType === 'json') {
          config.body = request.bodyContent;
        } else if (request.bodyType === 'raw') {
          config.body = request.bodyContent;
        } else if (request.bodyType === 'form-data') {
          // Convert to form data
          const formData = new FormData();
          try {
            const data = JSON.parse(request.bodyContent);
            Object.entries(data).forEach(([key, value]) => {
              formData.append(key, String(value));
            });
            config.body = formData;
            // Remove content-type to let browser set it with boundary
            delete (config.headers as any)['Content-Type'];
          } catch {
            config.body = request.bodyContent;
          }
        }
      }

      // Add query parameters for GET requests
      let requestUrl = fullUrl;
      if (request.method === 'GET' && request.parameters.length > 0) {
        const validParams = request.parameters.filter(p => p.key.trim());
        if (validParams.length > 0) {
          const params = new URLSearchParams();
          validParams.forEach(param => {
            params.append(param.key, param.value);
          });
          requestUrl += `${fullUrl.includes('?') ? '&' : '?'}${params.toString()}`;
        }
      }

      const startTime = Date.now();
      const response = await fetch(requestUrl, config);
      const endTime = Date.now();

      // Parse response data
      let data: any;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      // Convert headers to object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const apiResponse: ApiResponse = {
        status: response.status,
        statusText: response.statusText,
        data,
        headers: responseHeaders,
        timestamp: new Date().toISOString(),
        requestInfo: {
          url: requestUrl,
          method: request.method,
          hasAuth: !!request.authToken.trim(),
          duration: endTime - startTime
        }
      };

      if (!response.ok) {
        apiResponse.error = `HTTP ${response.status}: ${response.statusText}`;
      }

      return apiResponse;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }
);

// Async thunk for saving a request
export const saveApiRequest = createAsyncThunk<
  SavedRequest,
  { request: ApiRequest; name: string; description: string; tags: string[] },
  { rejectValue: string }
>(
  'request/saveApiRequest',
  async ({ request, name, description, tags }, { rejectWithValue }) => {
    try {
      const fullUrl = combineUrl(request.baseUrl, request.path);
      const savedRequest = RequestStorageService.apiRequestToSaved(
        request,
        fullUrl,
        name,
        description,
        tags
      );

      RequestStorageService.saveRequest(savedRequest);
      return savedRequest;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to save request'
      );
    }
  }
);

// Async thunk for loading saved requests
export const loadSavedRequests = createAsyncThunk<
  SavedRequest[],
  void,
  { rejectValue: string }
>(
  'savedRequests/loadAll',
  async (_, { rejectWithValue }) => {
    try {
      const history = RequestStorageService.getHistory();
      return history.requests;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load saved requests'
      );
    }
  }
);

// Async thunk for deleting a saved request
export const deleteSavedRequest = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'savedRequests/delete',
  async (requestId, { rejectWithValue }) => {
    try {
      RequestStorageService.deleteRequest(requestId);
      return requestId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete request'
      );
    }
  }
);
