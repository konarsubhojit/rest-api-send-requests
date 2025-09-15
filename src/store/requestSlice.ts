import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiRequest } from '../types/api';

interface RequestState extends ApiRequest {}

const initialState: RequestState = {
  baseUrl: '',
  path: '',
  method: 'GET',
  authToken: '',
  parameters: [{ id: crypto.randomUUID(), key: '', value: '' }],
  headers: [{ id: crypto.randomUUID(), key: '', value: '' }],
  bodyType: 'none',
  bodyContent: ''
};

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
    addParameter: (state, action: PayloadAction<{ id: string; key: string; value: string }>) => {
      state.parameters.push(action.payload);
    },
    removeParameter: (state, action: PayloadAction<number>) => {
      if (state.parameters.length > 1) {
        state.parameters.splice(action.payload, 1);
      }
    },
    updateHeader: (state, action: PayloadAction<{ index: number; field: 'key' | 'value'; value: string }>) => {
      const { index, field, value } = action.payload;
      if (state.headers[index]) {
        state.headers[index][field] = value;
      }
    },
    addHeader: (state, action: PayloadAction<{ id: string; key: string; value: string }>) => {
      state.headers.push(action.payload);
    },
    removeHeader: (state, action: PayloadAction<number>) => {
      if (state.headers.length > 1) {
        state.headers.splice(action.payload, 1);
      }
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
      return initialState;
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
  updateHeader,
  addHeader,
  removeHeader,
  setBodyType,
  setBodyContent,
  loadRequest,
  resetRequest
} = requestSlice.actions;

export default requestSlice.reducer;
