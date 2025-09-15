import { HttpMethod } from '../types/api';

export const HTTP_METHODS: readonly HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS'
] as const;

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

export const RESPONSE_TIMEOUT = 30000; // 30 seconds
export const DEBOUNCE_DELAY = 300; // 300ms
