/**
 * API service interface - Dependency Inversion Principle
 */
export interface IApiService {
  sendRequest(request: any): Promise<any>;
  validateRequest(request: any): Promise<boolean>;
  buildUrl(baseUrl: string, path: string, params?: any[]): string;
  buildHeaders(authToken?: string, customHeaders?: any[]): Record<string, string>;
}

/**
 * Authentication strategy interface - Strategy Pattern
 */
export interface IAuthStrategy {
  authenticate(token: string): Record<string, string>;
  validate(token: string): boolean;
  getType(): string;
}

/**
 * Body builder strategy interface - Strategy Pattern
 */
export interface IBodyBuilder {
  build(content: string, params?: any[]): string | null;
  getContentType(): string;
  supports(type: string): boolean;
}
