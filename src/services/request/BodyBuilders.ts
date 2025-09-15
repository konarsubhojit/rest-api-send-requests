import { IBodyBuilder } from '../interfaces/IApiService';

/**
 * JSON Body Builder Strategy
 */
export class JsonBodyBuilder implements IBodyBuilder {
  build(content: string, params?: any[]): string | null {
    if (content.trim()) {
      try {
        // Validate JSON format
        JSON.parse(content);
        return content;
      } catch {
        throw new Error('Invalid JSON format');
      }
    }
    
    // Build from parameters if no content provided
    if (params && params.length > 0) {
      const validParams = params.filter(p => p.key?.trim() && p.value?.trim());
      if (validParams.length > 0) {
        const obj: Record<string, string> = {};
        validParams.forEach(param => {
          obj[param.key] = param.value;
        });
        return JSON.stringify(obj, null, 2);
      }
    }
    
    return null;
  }

  getContentType(): string {
    return 'application/json';
  }

  supports(type: string): boolean {
    return type === 'json';
  }
}

/**
 * XML Body Builder Strategy
 */
export class XmlBodyBuilder implements IBodyBuilder {
  build(content: string): string | null {
    if (!content.trim()) return null;
    
    // Basic XML validation
    if (!content.includes('<') || !content.includes('>')) {
      throw new Error('Invalid XML format');
    }
    
    return content;
  }

  getContentType(): string {
    return 'application/xml';
  }

  supports(type: string): boolean {
    return type === 'xml';
  }
}

/**
 * Form Data Body Builder Strategy
 */
export class FormDataBodyBuilder implements IBodyBuilder {
  build(content: string, params?: any[]): string | null {
    if (content.trim()) {
      return content;
    }
    
    if (params && params.length > 0) {
      const validParams = params.filter(p => p.key?.trim() && p.value?.trim());
      if (validParams.length > 0) {
        return new URLSearchParams(
          validParams.map(p => [p.key, p.value])
        ).toString();
      }
    }
    
    return null;
  }

  getContentType(): string {
    return 'application/x-www-form-urlencoded';
  }

  supports(type: string): boolean {
    return type === 'form-data';
  }
}

/**
 * Raw Body Builder Strategy
 */
export class RawBodyBuilder implements IBodyBuilder {
  build(content: string): string | null {
    return content.trim() || null;
  }

  getContentType(): string {
    return 'text/plain';
  }

  supports(type: string): boolean {
    return type === 'raw';
  }
}

/**
 * Body Builder Factory - Factory Pattern
 */
export class BodyBuilderFactory {
  private static builders = new Map<string, IBodyBuilder>([
    ['json', new JsonBodyBuilder()],
    ['xml', new XmlBodyBuilder()],
    ['form-data', new FormDataBodyBuilder()],
    ['raw', new RawBodyBuilder()],
  ]);

  static getBuilder(type: string): IBodyBuilder {
    const builder = this.builders.get(type.toLowerCase());
    if (!builder) {
      throw new Error(`Unsupported body type: ${type}`);
    }
    return builder;
  }

  static registerBuilder(type: string, builder: IBodyBuilder): void {
    this.builders.set(type.toLowerCase(), builder);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.builders.keys());
  }
}
