import { SavedRequest, ApiRequest, RequestHistory } from '../types/api';

const STORAGE_KEY = 'rest-api-saved-requests';
const HISTORY_KEY = 'rest-api-request-history';

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
      headers: [...apiRequest.headers],
      authToken: apiRequest.authToken,
      bodyType: apiRequest.bodyType,
      bodyContent: apiRequest.bodyContent,
      isFavorite: false,
      createdAt: timestamp,
      lastUsed: timestamp,
      tags
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
      authToken: savedRequest.authToken,
      parameters: [...savedRequest.parameters],
      headers: [...savedRequest.headers],
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
    
    // Remove existing request with same ID if it exists
    history.requests = history.requests.filter(r => r.id !== savedRequest.id);
    
    // Add the new/updated request
    history.requests.unshift(savedRequest);
    
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
        return JSON.parse(stored);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
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
    return JSON.stringify(history, null, 2);
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
      
      this.setHistory(imported);
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  /**
   * Generate a unique ID
   */
  private static generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
