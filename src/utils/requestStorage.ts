import { SavedRequest, ApiRequest, RequestHistory } from '../types/api';

const STORAGE_KEY = 'rest-api-saved-requests';
export const SECRET_PLACEHOLDER = '[REDACTED - re-enter before sending]';

/**
 * Utility functions for managing saved requests and history
 */
export class RequestStorageService {
  
  /**
   * Convert ApiRequest to SavedRequest format
   */
  static apiRequestToSaved(
    apiRequest: ApiRequest,
    url: string,
    name?: string,
    description?: string,
    tags: string[] = []
  ): SavedRequest {
    const fullUrl = `${apiRequest.baseUrl}${apiRequest.path}`;
    const timestamp = new Date().toISOString();
    
    return {
      id: this.generateId(),
      name: name || `${apiRequest.method} ${fullUrl}`,
      description,
      url: fullUrl,
      method: apiRequest.method,
      parameters: [...apiRequest.parameters],
      headers: this.sanitizeHeaders(apiRequest.headers),
      authToken: apiRequest.authToken ? SECRET_PLACEHOLDER : '',
      bodyType: apiRequest.bodyType,
      bodyContent: apiRequest.bodyContent,
      isFavorite: false,
      createdAt: timestamp,
      lastUsed: timestamp,
      tags,
      folder: ''
    };
  }

  /**
   * Convert SavedRequest back to ApiRequest format
   */
  static savedToApiRequest(savedRequest: SavedRequest): { apiRequest: ApiRequest; fullUrl: string } {
    // Try to split URL into base and path
    let baseUrl = '';
    let path = '';
    
    try {
      const urlObj = new URL(savedRequest.url);
      baseUrl = `${urlObj.protocol}//${urlObj.host}`;
      path = `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    } catch {
      // If URL parsing fails, treat entire URL as baseUrl
      baseUrl = savedRequest.url;
      path = '';
    }

    const apiRequest: ApiRequest = {
      baseUrl,
      path,
      method: savedRequest.method,
      authToken: '',
      parameters: [...savedRequest.parameters],
      headers: savedRequest.headers.map(header => ({
        ...header,
        value: header.value === SECRET_PLACEHOLDER ? '' : header.value
      })),
      bodyType: savedRequest.bodyType,
      bodyContent: savedRequest.bodyContent
    };

    return { apiRequest, fullUrl: savedRequest.url };
  }

  /**
   * Save a new request to history
   */
  static saveRequest(savedRequest: SavedRequest): void {
    const history = this.getHistory();
    const sanitizedRequest = this.sanitizeSavedRequest(savedRequest);
    
    // Remove existing request with same ID if it exists
    history.requests = history.requests.filter(r => r.id !== sanitizedRequest.id);
    
    // Add the new/updated request
    history.requests.unshift(sanitizedRequest);
    
    // Limit history to 100 requests
    if (history.requests.length > 100) {
      history.requests = history.requests.slice(0, 100);
    }
    
    this.setHistory(history);
  }

  /**
   * Get all saved requests from history
   */
  static getHistory(): RequestHistory {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RequestHistory;
        if (!Array.isArray(parsed.requests)) return { requests: [], favorites: [] };
        return {
          requests: parsed.requests.map(request => this.sanitizeSavedRequest(request)),
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites : []
        };
      }
    } catch (error) {
      console.warn('Failed to load request history:', error);
    }
    
    return { requests: [], favorites: [] };
  }

  /**
   * Set the entire history
   */
  static setHistory(history: RequestHistory): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...history,
        requests: history.requests.map(request => this.sanitizeSavedRequest(request))
      }));
    } catch (error) {
      console.error('Failed to save request history:', error);
    }
  }

  /**
   * Toggle favorite status for a request
   */
  static toggleFavorite(requestId: string): void {
    const history = this.getHistory();
    const request = history.requests.find(r => r.id === requestId);
    
    if (request) {
      request.isFavorite = !request.isFavorite;
      
      if (request.isFavorite && !history.favorites.includes(requestId)) {
        history.favorites.push(requestId);
      } else if (!request.isFavorite) {
        history.favorites = history.favorites.filter(id => id !== requestId);
      }
      
      this.setHistory(history);
    }
  }

  /**
   * Delete a request from history
   */
  static deleteRequest(requestId: string): void {
    const history = this.getHistory();
    history.requests = history.requests.filter(r => r.id !== requestId);
    history.favorites = history.favorites.filter(id => id !== requestId);
    this.setHistory(history);
  }

  static renameRequest(requestId: string, name: string): void {
    this.updateRequest(requestId, request => ({ ...request, name: name.trim() || request.name }));
  }

  static moveRequest(requestId: string, folder: string): void {
    this.updateRequest(requestId, request => ({ ...request, folder: folder.trim() }));
  }

  static duplicateRequest(requestId: string): SavedRequest | undefined {
    const original = this.getHistory().requests.find(request => request.id === requestId);
    if (!original) return undefined;
    const duplicate = {
      ...original,
      id: this.generateId(),
      name: `${original.name} copy`,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    this.saveRequest(duplicate);
    return duplicate;
  }

  /**
   * Update the last used timestamp for a request
   */
  static updateLastUsed(requestId: string): void {
    const history = this.getHistory();
    const request = history.requests.find(r => r.id === requestId);
    
    if (request) {
      request.lastUsed = new Date().toISOString();
      this.setHistory(history);
    }
  }

  /**
   * Get favorite requests
   */
  static getFavorites(): SavedRequest[] {
    const history = this.getHistory();
    return history.requests.filter(r => r.isFavorite);
  }

  /**
   * Search requests by name, URL, or tags
   */
  static searchRequests(query: string): SavedRequest[] {
    const history = this.getHistory();
    const lowerQuery = query.toLowerCase();
    
    return history.requests.filter(request => 
      request.name.toLowerCase().includes(lowerQuery) ||
      request.url.toLowerCase().includes(lowerQuery) ||
      request.description?.toLowerCase().includes(lowerQuery) ||
      request.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      request.method.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear all history
   */
  static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Export history as JSON
   */
  static exportHistory(): string {
    const history = this.getHistory();
    return JSON.stringify({
      ...history,
      requests: history.requests.map(request => this.sanitizeSavedRequest(request))
    }, null, 2);
  }

  /**
   * Import history from JSON
   */
  static importHistory(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData) as RequestHistory;
      
      // Validate the imported data structure
      if (!imported.requests || !Array.isArray(imported.requests)) {
        throw new Error('Invalid data format');
      }
      
      this.setHistory({
        requests: imported.requests.map(request => this.sanitizeSavedRequest(request)),
        favorites: Array.isArray(imported.favorites) ? imported.favorites : []
      });
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  static createShareFragment(apiRequest: ApiRequest, fullUrl: string): string {
    const shared = this.apiRequestToSaved(apiRequest, fullUrl);
    const payload = {
      url: shared.url,
      method: shared.method,
      parameters: shared.parameters,
      headers: shared.headers,
      bodyType: shared.bodyType,
      bodyContent: shared.bodyContent
    };
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return `#request=${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
  }

  static parseShareFragment(fragment: string): ApiRequest | null {
    if (!fragment.startsWith('#request=')) return null;
    try {
      const encoded = fragment.slice('#request='.length).replace(/-/g, '+').replace(/_/g, '/');
      const binary = atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '='));
      const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
      const shared = JSON.parse(new TextDecoder().decode(bytes));
      if (typeof shared.url !== 'string' || typeof shared.method !== 'string') return null;
      return this.savedToApiRequest(this.sanitizeSavedRequest({
        ...shared,
        id: 'shared',
        name: 'Shared request',
        description: '',
        authToken: '',
        isFavorite: false,
        createdAt: '',
        lastUsed: '',
        tags: [],
        folder: ''
      })).apiRequest;
    } catch {
      return null;
    }
  }

  private static sanitizeHeaders(headers: SavedRequest['headers'] = []): SavedRequest['headers'] {
    return headers.map(header => ({
      ...header,
      value: header.key.trim().toLowerCase() === 'authorization'
        ? SECRET_PLACEHOLDER
        : header.value
    }));
  }

  private static sanitizeSavedRequest(request: SavedRequest): SavedRequest {
    return {
      ...request,
      parameters: Array.isArray(request.parameters) ? request.parameters : [],
      headers: this.sanitizeHeaders(Array.isArray(request.headers) ? request.headers : []),
      authToken: request.authToken ? SECRET_PLACEHOLDER : '',
      tags: Array.isArray(request.tags) ? request.tags : [],
      folder: typeof request.folder === 'string' ? request.folder : ''
    };
  }

  private static updateRequest(
    requestId: string,
    update: (request: SavedRequest) => SavedRequest
  ): void {
    const history = this.getHistory();
    history.requests = history.requests.map(request =>
      request.id === requestId ? update(request) : request
    );
    this.setHistory(history);
  }

  /**
   * Generate a unique ID
   */
  private static generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
