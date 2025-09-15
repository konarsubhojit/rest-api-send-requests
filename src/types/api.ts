export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

export interface ApiRequest {
  baseUrl: string;
  path: string;
  method: HttpMethod;
  authToken: string;
  parameters: KeyValuePair[];
  headers: KeyValuePair[];
  bodyType: 'json' | 'xml' | 'form-data' | 'raw' | 'none';
  bodyContent: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  error?: string;
  timestamp?: string;
  requestInfo?: {
    url: string;
    method: string;
    hasAuth: boolean;
    duration?: number;
  };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface SavedRequest {
  id: string;
  name: string;
  description?: string;
  url: string;
  method: HttpMethod;
  parameters: KeyValuePair[];
  headers: KeyValuePair[];
  authToken: string;
  bodyType: 'json' | 'xml' | 'form-data' | 'raw' | 'none';
  bodyContent: string;
  isFavorite: boolean;
  createdAt: string;
  lastUsed: string;
  tags: string[];
}

export interface RequestHistory {
  requests: SavedRequest[];
  favorites: string[]; // Array of request IDs
}
