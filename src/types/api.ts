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
}

export interface ApiResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  error?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
