import { ApiRequest } from '../types/api';

/**
 * Utility functions for converting between API requests and cURL commands
 */
export class CurlUtils {
  
  /**
   * Convert an ApiRequest to a cURL command string
   */
  static apiRequestToCurl(request: ApiRequest, fullUrl: string): string {
    const parts: string[] = ['curl'];
    
    // Add method (only if not GET)
    if (request.method !== 'GET') {
      parts.push(`-X ${request.method}`);
    }
    
    // Add headers
    const allHeaders: Record<string, string> = {};
    
    // Add custom headers
    request.headers
      .filter(h => h.key.trim() && h.value.trim())
      .forEach(header => {
        allHeaders[header.key] = header.value;
      });
    
    // Add auth token as Authorization header
    if (request.authToken.trim()) {
      allHeaders['Authorization'] = `Bearer ${request.authToken}`;
    }
    
    // Add Content-Type based on body type (if not already specified)
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const hasCustomContentType = Object.keys(allHeaders).some(key => 
        key.toLowerCase() === 'content-type'
      );
      
      if (!hasCustomContentType) {
        if (request.bodyType === 'json') {
          allHeaders['Content-Type'] = 'application/json';
        } else if (request.bodyType === 'xml') {
          allHeaders['Content-Type'] = 'application/xml';
        } else if (request.bodyType === 'form-data') {
          allHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        } else if (request.bodyType === 'raw') {
          allHeaders['Content-Type'] = 'text/plain';
        } else if (request.bodyType === 'none' && request.parameters.some(p => p.key.trim() && p.value.trim())) {
          allHeaders['Content-Type'] = 'application/json';
        }
      }
    }
    
    // Add all headers to curl command
    Object.entries(allHeaders).forEach(([key, value]) => {
      parts.push(`-H "${this.escapeQuotes(key)}: ${this.escapeQuotes(value)}"`);
    });
    
    // Add request body
    const body = this.buildRequestBody(request);
    if (body) {
      parts.push(`--data '${this.escapeSingleQuotes(body)}'`);
    }
    
    // Build final URL with query parameters for GET requests
    let finalUrl = fullUrl;
    if (request.method === 'GET' && request.parameters.length > 0) {
      const validParams = request.parameters.filter(p => p.key.trim() && p.value.trim());
      if (validParams.length > 0) {
        try {
          const urlObj = new URL(fullUrl);
          validParams.forEach(param => {
            urlObj.searchParams.set(param.key, param.value);
          });
          finalUrl = urlObj.toString();
        } catch {
          // If URL parsing fails, append query string manually
          const queryString = validParams
            .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
            .join('&');
          finalUrl = fullUrl + (fullUrl.includes('?') ? '&' : '?') + queryString;
        }
      }
    }
    
    // Add URL (quoted)
    parts.push(`"${this.escapeQuotes(finalUrl)}"`);
    
    return parts.join(' \\\n  ');
  }
  
  /**
   * Parse a cURL command and convert it to an ApiRequest
   */
  static curlToApiRequest(curlCommand: string): { apiRequest: ApiRequest; fullUrl: string } {
    // Remove line breaks and normalize whitespace
    const normalized = curlCommand
      .replace(/\\\s*\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Initialize request object with defaults
    const apiRequest: ApiRequest = {
      baseUrl: '',
      path: '',
      method: 'GET',
      authToken: '',
      parameters: [{ id: crypto.randomUUID(), key: '', value: '' }],
      headers: [{ id: crypto.randomUUID(), key: '', value: '' }],
      bodyType: 'none',
      bodyContent: ''
    };
    
    let fullUrl = '';
    const headers: Record<string, string> = {};
    let body = '';
    
    // Parse the command using a simple state machine
    const tokens = this.tokenizeCurlCommand(normalized);
    let i = 0;
    
    // Skip 'curl' if present
    if (tokens[i] === 'curl') {
      i++;
    }
    
    while (i < tokens.length) {
      const token = tokens[i];
      
      if (token === '-X' || token === '--request') {
        i++;
        if (i < tokens.length) {
          apiRequest.method = tokens[i].toUpperCase() as any;
        }
      } else if (token === '-H' || token === '--header') {
        i++;
        if (i < tokens.length) {
          const headerStr = this.unquoteString(tokens[i]);
          const colonIndex = headerStr.indexOf(':');
          if (colonIndex > 0) {
            const key = headerStr.substring(0, colonIndex).trim();
            const value = headerStr.substring(colonIndex + 1).trim();
            headers[key] = value;
          }
        }
      } else if (token === '-d' || token === '--data' || token === '--data-raw') {
        i++;
        if (i < tokens.length) {
          body = this.unquoteString(tokens[i]);
        }
      } else if (token === '--data-binary' || token === '--data-urlencode') {
        i++;
        if (i < tokens.length) {
          body = this.unquoteString(tokens[i]);
        }
      } else if (!token.startsWith('-') && token.length > 0) {
        // This should be the URL
        fullUrl = this.unquoteString(token);
      }
      
      i++;
    }
    
    // Process the URL
    if (fullUrl) {
      try {
        const urlObj = new URL(fullUrl);
        apiRequest.baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        apiRequest.path = urlObj.pathname;
        
        // Extract query parameters for GET requests
        if (apiRequest.method === 'GET' && urlObj.searchParams.size > 0) {
          apiRequest.parameters = [];
          urlObj.searchParams.forEach((value, key) => {
            apiRequest.parameters.push({
              id: crypto.randomUUID(),
              key,
              value
            });
          });
          // Add empty parameter for UI
          apiRequest.parameters.push({ id: crypto.randomUUID(), key: '', value: '' });
        }
      } catch {
        // If URL parsing fails, use as baseUrl
        apiRequest.baseUrl = fullUrl;
        apiRequest.path = '';
      }
    }
    
    // Process headers
    const headerEntries = Object.entries(headers);
    if (headerEntries.length > 0) {
      apiRequest.headers = headerEntries.map(([key, value]) => ({
        id: crypto.randomUUID(),
        key,
        value
      }));
      
      // Check for Authorization header and extract token
      const authHeader = headers['Authorization'] || headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        apiRequest.authToken = authHeader.substring(7);
        // Remove Authorization header from the headers list
        apiRequest.headers = apiRequest.headers.filter(h => 
          h.key.toLowerCase() !== 'authorization'
        );
      }
      
      // Add empty header for UI
      apiRequest.headers.push({ id: crypto.randomUUID(), key: '', value: '' });
    }
    
    // Process body
    if (body) {
      // Try to determine body type based on content and Content-Type header
      const contentType = headers['Content-Type'] || headers['content-type'] || '';
      
      if (contentType.includes('application/json') || this.isJsonString(body)) {
        apiRequest.bodyType = 'json';
        apiRequest.bodyContent = this.tryFormatJson(body);
      } else if (contentType.includes('application/xml') || this.isXmlString(body)) {
        apiRequest.bodyType = 'xml';
        apiRequest.bodyContent = body;
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        apiRequest.bodyType = 'form-data';
        apiRequest.bodyContent = body;
      } else {
        apiRequest.bodyType = 'raw';
        apiRequest.bodyContent = body;
      }
    }
    
    return { apiRequest, fullUrl };
  }
  
  /**
   * Build request body based on body type and content
   */
  private static buildRequestBody(request: ApiRequest): string {
    if (request.bodyType === 'none') {
      // Build JSON from parameters for non-GET requests
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        const validParams = request.parameters.filter(p => p.key.trim() && p.value.trim());
        if (validParams.length > 0) {
          const bodyObj: Record<string, string> = {};
          validParams.forEach(param => {
            bodyObj[param.key] = param.value;
          });
          return JSON.stringify(bodyObj);
        }
      }
      return '';
    }
    
    return request.bodyContent;
  }
  
  /**
   * Tokenize cURL command while respecting quotes
   */
  private static tokenizeCurlCommand(command: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < command.length; i++) {
      const char = command[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        current += char;
        quoteChar = '';
      } else if (!inQuotes && char === ' ') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      tokens.push(current.trim());
    }
    
    return tokens;
  }
  
  /**
   * Remove quotes from a string if present
   */
  private static unquoteString(str: string): string {
    if ((str.startsWith('"') && str.endsWith('"')) || 
        (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1);
    }
    return str;
  }
  
  /**
   * Escape double quotes in a string
   */
  private static escapeQuotes(str: string): string {
    return str.replace(/"/g, '\\"');
  }
  
  /**
   * Escape single quotes in a string for shell commands
   */
  private static escapeSingleQuotes(str: string): string {
    return str.replace(/'/g, "'\\''");
  }
  
  /**
   * Check if a string is valid JSON
   */
  private static isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Check if a string looks like XML
   */
  private static isXmlString(str: string): boolean {
    const trimmed = str.trim();
    return trimmed.startsWith('<') && trimmed.includes('>');
  }
  
  /**
   * Try to format JSON string with indentation
   */
  private static tryFormatJson(str: string): string {
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  }
}
