import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  activeTab: 'request' | 'saved';
  currentRequestId: string | undefined;
  showSaveDialog: boolean;
  showCurlDialog: boolean;
  curlMode: 'export' | 'import';
}

const initialState: UiState = {
  activeTab: 'request',
  currentRequestId: undefined,
  showSaveDialog: false,
  showCurlDialog: false,
  curlMode: 'export'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'request' | 'saved'>) => {
      state.activeTab = action.payload;
    },
    setCurrentRequestId: (state, action: PayloadAction<string | undefined>) => {
      state.currentRequestId = action.payload;
    },
    setShowSaveDialog: (state, action: PayloadAction<boolean>) => {
      state.showSaveDialog = action.payload;
    },
    setShowCurlDialog: (state, action: PayloadAction<boolean>) => {
      state.showCurlDialog = action.payload;
    },
    setCurlMode: (state, action: PayloadAction<'export' | 'import'>) => {
      state.curlMode = action.payload;
    }
  }
});

export const {
  setActiveTab,
  setCurrentRequestId,
  setShowSaveDialog,
  setShowCurlDialog,
  setCurlMode
} = uiSlice.actions;

export default uiSlice.reducer;
