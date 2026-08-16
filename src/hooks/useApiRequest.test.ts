import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { ApiRequest } from '../types/api';
import { useApiRequest } from './useApiRequest';

const request: ApiRequest = {
  baseUrl: 'https://api.example.com',
  path: '',
  method: 'GET',
  authToken: 'secret',
  parameters: [],
  headers: [],
  bodyType: 'none',
  bodyContent: ''
};

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubGlobal('fetch', vi.fn());
});

it('warns before sending credentials through the proxy', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  const { result } = renderHook(() => useApiRequest('https://proxy.example'));

  act(() => result.current.setUseProxy(true));
  await act(async () => {
    await result.current.sendRequest(request, request.baseUrl);
  });

  expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('credentials'));
  expect(fetch).not.toHaveBeenCalled();
});

it('marks direct network failures as likely CORS errors', async () => {
  vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
  const { result } = renderHook(() => useApiRequest('https://proxy.example'));

  await act(async () => {
    await expect(result.current.sendRequest({ ...request, authToken: '' }, request.baseUrl))
      .rejects.toThrow('Failed to fetch');
  });

  expect(result.current.responses[0]).toMatchObject({
    corsLikely: true,
    viaProxy: false
  });
});
