import { IApiService, IAuthStrategy } from '../interfaces/IApiService';
import { AuthStrategyFactory } from '../auth/AuthStrategies';
import { BodyBuilderFactory } from '../request/BodyBuilders';
import { DEFAULT_HEADERS } from '../../utils/constants';
import { ApiRequest, ApiResponse } from '../../types/api';

/**
 * API Service Implementation - Facade Pattern
 * Provides a simplified interface to complex request building and sending logic
 * Follows DIP by depending on abstractions rather than concrete implementations
 */
export class ApiService implements IApiService {
  constructor(
    private authStrategyFactory: typeof AuthStrategyFactory = AuthStrategyFactory,
    private bodyBuilderFactory: typeof BodyBuilderFactory = BodyBuilderFactory
  ) {}

  async sendRequest(request: ApiRequest): Promise<ApiResponse> {
    try {
      const url = this.buildUrl(request.baseUrl, request.path, request.parameters);
      const headers = this.buildHeaders(request.authToken, request.headers);
      const body = this.buildBody(request);

      const response = await fetch(url, {
        method: request.method,
        headers,
        body,
      });

      const responseData = await this.parseResponse(response);
      
      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async validateRequest(request: ApiRequest): Promise<boolean> {
    try {
      // Validate URL
      new URL(this.buildUrl(request.baseUrl, request.path));
      
      // Validate auth token if provided
      if (request.authToken) {
        const strategy = this.getAuthStrategy(request.authToken);
        if (!strategy.validate(request.authToken)) {
          return false;
        }
      }
      
      // Validate body if provided
      if (request.bodyContent && request.bodyType !== 'none') {
        this.buildBody(request);
      }
      
      return true;
    } catch {
      return false;
    }
  }

  buildUrl(baseUrl: string, path: string, params?: any[]): string {
    if (!baseUrl) throw new Error('Base URL is required');
    
    let fullUrl = baseUrl;
    if (path && !fullUrl.endsWith('/') && !path.startsWith('/')) {
      fullUrl += '/';
    }
    fullUrl += path || '';

    // Add query parameters for GET requests
    if (params && params.length > 0) {
      const validParams = params.filter(p => p.key?.trim() && p.value?.trim());
      if (validParams.length > 0) {
        try {
          const url = new URL(fullUrl);
          validParams.forEach(param => {
            url.searchParams.set(param.key, param.value);
          });
          return url.toString();
        } catch {
          // If URL parsing fails, return original
        }
      }
    }
    
    return fullUrl;
  }

  buildHeaders(authToken?: string, customHeaders?: any[]): Record<string, string> {
    const headers: Record<string, string> = { ...DEFAULT_HEADERS };
    
    // Add custom headers
    if (customHeaders) {
      customHeaders
        .filter(h => h.key?.trim() && h.value?.trim())
        .forEach(header => {
          headers[header.key] = header.value;
        });
    }
    
    // Add authentication headers
    if (authToken?.trim()) {
      try {
        const authStrategy = this.getAuthStrategy(authToken);
        const authHeaders = authStrategy.authenticate(authToken);
        Object.assign(headers, authHeaders);
      } catch (error) {
        console.warn('Authentication failed:', error);
      }
    }
    
    return headers;
  }

  private buildBody(request: ApiRequest): string | null {
    if (request.method === 'GET' || request.method === 'HEAD') {
      return null;
    }
    
    if (request.bodyType === 'none') {
      return null;
    }
    
    try {
      const builder = this.bodyBuilderFactory.getBuilder(request.bodyType);
      return builder.build(request.bodyContent, request.parameters);
    } catch (error) {
      console.warn('Body building failed:', error);
      return null;
    }
  }

  private getAuthStrategy(token: string): IAuthStrategy {
    // Simple heuristic to determine auth type
    // In a real app, this might be configurable
    if (token.includes(':')) {
      return this.authStrategyFactory.getStrategy('basic');
    } else {
      return this.authStrategyFactory.getStrategy('bearer');
    }
  }

  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/')) {
      return await response.text();
    } else {
      return await response.blob();
    }
  }
}
