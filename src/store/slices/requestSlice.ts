import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { ApiRequest } from '../../types/api';
import type { RootState } from '../index';

interface RequestState extends ApiRequest {}

// Fixed initial state - don't generate UUIDs in initial state
const createInitialState = (): RequestState => ({
  baseUrl: '',
  path: '',
  method: 'GET',
  authToken: '',
  parameters: [{ id: '1', key: '', value: '' }],
  headers: [{ id: '1', key: '', value: '' }],
  bodyType: 'none',
  bodyContent: ''
});

const initialState: RequestState = createInitialState();

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    setBaseUrl: (state, action: PayloadAction<string>) => {
      state.baseUrl = action.payload;
    },
    setPath: (state, action: PayloadAction<string>) => {
      state.path = action.payload;
    },
    setMethod: (state, action: PayloadAction<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'>) => {
      state.method = action.payload;
    },
    setAuthToken: (state, action: PayloadAction<string>) => {
      state.authToken = action.payload;
    },
    updateParameter: (state, action: PayloadAction<{ index: number; field: 'key' | 'value'; value: string }>) => {
      const { index, field, value } = action.payload;
      if (state.parameters[index]) {
        state.parameters[index][field] = value;
      }
    },
    addParameter: (state, action: PayloadAction<{ id?: string; key: string; value: string }>) => {
      state.parameters.push({
        id: action.payload.id || crypto.randomUUID(),
        key: action.payload.key,
        value: action.payload.value
      });
    },
    removeParameter: (state, action: PayloadAction<number>) => {
      if (state.parameters.length > 1) {
        state.parameters.splice(action.payload, 1);
      }
    },
    replaceParameters: (state, action: PayloadAction<Array<{ key: string; value: string }>>) => {
      state.parameters = action.payload.map(param => ({
        id: crypto.randomUUID(),
        key: param.key,
        value: param.value
      }));
    },
    updateHeader: (state, action: PayloadAction<{ index: number; field: 'key' | 'value'; value: string }>) => {
      const { index, field, value } = action.payload;
      if (state.headers[index]) {
        state.headers[index][field] = value;
      }
    },
    addHeader: (state, action: PayloadAction<{ id?: string; key: string; value: string }>) => {
      state.headers.push({
        id: action.payload.id || crypto.randomUUID(),
        key: action.payload.key,
        value: action.payload.value
      });
    },
    removeHeader: (state, action: PayloadAction<number>) => {
      if (state.headers.length > 1) {
        state.headers.splice(action.payload, 1);
      }
    },
    replaceHeaders: (state, action: PayloadAction<Array<{ key: string; value: string }>>) => {
      state.headers = action.payload.map(header => ({
        id: crypto.randomUUID(),
        key: header.key,
        value: header.value
      }));
    },
    setBodyType: (state, action: PayloadAction<'json' | 'xml' | 'form-data' | 'raw' | 'none'>) => {
      state.bodyType = action.payload;
    },
    setBodyContent: (state, action: PayloadAction<string>) => {
      state.bodyContent = action.payload;
    },
    loadRequest: (state, action: PayloadAction<ApiRequest>) => {
      return { ...action.payload };
    },
    resetRequest: () => {
      return createInitialState();
    },
    setUrlComponents: (state, action: PayloadAction<{ baseUrl?: string; path?: string; parameters?: Array<{ key: string; value: string }> }>) => {
      if (action.payload.baseUrl !== undefined) {
        state.baseUrl = action.payload.baseUrl;
      }
      if (action.payload.path !== undefined) {
        state.path = action.payload.path;
      }
      if (action.payload.parameters) {
        state.parameters = action.payload.parameters.map(param => ({
          id: crypto.randomUUID(),
          key: param.key,
          value: param.value
        }));
      }
    }
  }
});

export const {
  setBaseUrl,
  setPath,
  setMethod,
  setAuthToken,
  updateParameter,
  addParameter,
  removeParameter,
  replaceParameters,
  updateHeader,
  addHeader,
  removeHeader,
  replaceHeaders,
  setBodyType,
  setBodyContent,
  loadRequest,
  resetRequest,
  setUrlComponents
} = requestSlice.actions;

// Selectors for optimized state access
export const selectRequest = (state: RootState) => state.request;
export const selectBaseUrl = (state: RootState) => state.request.baseUrl;
export const selectPath = (state: RootState) => state.request.path;
export const selectMethod = (state: RootState) => state.request.method;
export const selectAuthToken = (state: RootState) => state.request.authToken;
export const selectParameters = (state: RootState) => state.request.parameters;
export const selectHeaders = (state: RootState) => state.request.headers;
export const selectBodyType = (state: RootState) => state.request.bodyType;
export const selectBodyContent = (state: RootState) => state.request.bodyContent;

// Memoized selectors for computed values
export const selectFullUrl = createSelector(
  [selectBaseUrl, selectPath],
  (baseUrl, path) => {
    if (!baseUrl.trim() && !path.trim()) return '';
    if (!baseUrl.trim()) return path;
    if (!path.trim()) return baseUrl;
    
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return cleanPath ? `${cleanBaseUrl}/${cleanPath}` : cleanBaseUrl;
  }
);

export const selectValidParameters = createSelector(
  [selectParameters],
  (parameters) => parameters.filter(param => param.key.trim() !== '' || param.value.trim() !== '')
);

export const selectValidHeaders = createSelector(
  [selectHeaders],
  (headers) => headers.filter(header => header.key.trim() !== '' || header.value.trim() !== '')
);

export const selectIsRequestValid = createSelector(
  [selectFullUrl],
  (fullUrl) => fullUrl.trim().length > 0
);

export const selectHasAuthToken = createSelector(
  [selectAuthToken],
  (authToken) => authToken.trim().length > 0
);

export const selectRequestSummary = createSelector(
  [selectMethod, selectFullUrl, selectHasAuthToken, selectValidParameters, selectValidHeaders],
  (method, fullUrl, hasAuth, parameters, headers) => ({
    method,
    url: fullUrl,
    hasAuth,
    parameterCount: parameters.length,
    headerCount: headers.length
  })
);

export default requestSlice.reducer;
