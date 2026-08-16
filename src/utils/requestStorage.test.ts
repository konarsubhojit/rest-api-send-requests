import { beforeEach, describe, expect, it } from 'vitest';
import { ApiRequest } from '../types/api';
import { RequestStorageService, SECRET_PLACEHOLDER } from './requestStorage';

const request: ApiRequest = {
  baseUrl: 'https://api.example.com',
  path: '/users',
  method: 'GET',
  authToken: 'bearer-secret',
  parameters: [{ id: 'p1', key: 'page', value: '1' }],
  headers: [
    { id: 'h1', key: 'Authorization', value: 'Basic secret' },
    { id: 'h2', key: 'Accept', value: 'application/json' }
  ],
  bodyType: 'none',
  bodyContent: ''
};

describe('RequestStorageService', () => {
  beforeEach(() => localStorage.clear());

  it('strips credentials when saving, exporting, and sharing', () => {
    const saved = RequestStorageService.apiRequestToSaved(request, 'https://api.example.com/users');
    RequestStorageService.saveRequest(saved);

    const stored = localStorage.getItem('rest-api-saved-requests') || '';
    const exported = RequestStorageService.exportHistory();
    const fragment = RequestStorageService.createShareFragment(request, saved.url);

    for (const value of [stored, exported, fragment]) {
      expect(value).not.toContain('bearer-secret');
      expect(value).not.toContain('Basic secret');
    }
    expect(RequestStorageService.getHistory().requests[0].authToken).toBe(SECRET_PLACEHOLDER);
    expect(RequestStorageService.getHistory().requests[0].headers[0].value).toBe(SECRET_PLACEHOLDER);
    expect(RequestStorageService.parseShareFragment(fragment)?.authToken).toBe('');
  });

  it('supports rename, duplicate, folder organization, and delete', () => {
    const saved = RequestStorageService.apiRequestToSaved(request, 'https://api.example.com/users', 'Users');
    RequestStorageService.saveRequest(saved);
    RequestStorageService.renameRequest(saved.id, 'All users');
    RequestStorageService.moveRequest(saved.id, 'Examples');
    const duplicate = RequestStorageService.duplicateRequest(saved.id);

    expect(RequestStorageService.getHistory().requests).toHaveLength(2);
    expect(duplicate?.name).toBe('All users copy');
    expect(duplicate?.folder).toBe('Examples');

    RequestStorageService.deleteRequest(saved.id);
    expect(RequestStorageService.getHistory().requests).toHaveLength(1);
  });

  it('strips secrets from imported collections', () => {
    const saved = {
      ...RequestStorageService.apiRequestToSaved({ ...request, authToken: '' }, request.baseUrl),
      authToken: 'imported-secret',
      headers: [{ id: 'auth', key: 'authorization', value: 'imported-header-secret' }]
    };

    expect(RequestStorageService.importHistory(JSON.stringify({
      requests: [saved],
      favorites: []
    }))).toBe(true);
    expect(RequestStorageService.exportHistory()).not.toContain('imported-secret');
    expect(RequestStorageService.exportHistory()).not.toContain('imported-header-secret');
  });
});
