import { IAuthStrategy } from '../interfaces/IApiService';

/**
 * Bearer Token Authentication Strategy
 */
export class BearerAuthStrategy implements IAuthStrategy {
  authenticate(token: string): Record<string, string> {
    if (!this.validate(token)) {
      throw new Error('Invalid bearer token');
    }
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  validate(token: string): boolean {
    return Boolean(token && token.trim().length > 0);
  }

  getType(): string {
    return 'Bearer';
  }
}

/**
 * Basic Authentication Strategy
 */
export class BasicAuthStrategy implements IAuthStrategy {
  authenticate(credentials: string): Record<string, string> {
    if (!this.validate(credentials)) {
      throw new Error('Invalid basic auth credentials');
    }
    
    return {
      'Authorization': `Basic ${btoa(credentials)}`
    };
  }

  validate(credentials: string): boolean {
    return Boolean(credentials && credentials.includes(':'));
  }

  getType(): string {
    return 'Basic';
  }
}

/**
 * API Key Authentication Strategy
 */
export class ApiKeyAuthStrategy implements IAuthStrategy {
  constructor(private headerName: string = 'X-API-Key') {}

  authenticate(apiKey: string): Record<string, string> {
    if (!this.validate(apiKey)) {
      throw new Error('Invalid API key');
    }
    
    return {
      [this.headerName]: apiKey
    };
  }

  validate(apiKey: string): boolean {
    return Boolean(apiKey && apiKey.trim().length > 0);
  }

  getType(): string {
    return 'API-Key';
  }
}

/**
 * Auth Strategy Factory - Factory Pattern
 */
export class AuthStrategyFactory {
  private static strategies = new Map<string, IAuthStrategy>([
    ['bearer', new BearerAuthStrategy()],
    ['basic', new BasicAuthStrategy()],
    ['api-key', new ApiKeyAuthStrategy()],
  ]);

  static getStrategy(type: string): IAuthStrategy {
    const strategy = this.strategies.get(type.toLowerCase());
    if (!strategy) {
      throw new Error(`Unsupported authentication type: ${type}`);
    }
    return strategy;
  }

  static registerStrategy(type: string, strategy: IAuthStrategy): void {
    this.strategies.set(type.toLowerCase(), strategy);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.strategies.keys());
  }
}
