import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

interface UiState {
  activeTab: 'request' | 'saved';
  currentRequestId: string | undefined;
  // Enhanced UI state
  isLoading: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: number;
  }>;
  preferences: {
    autoSave: boolean;
    showTimestamps: boolean;
    compactMode: boolean;
  };
}

const initialState: UiState = {
  activeTab: 'request',
  currentRequestId: undefined,
  isLoading: false,
  notifications: [],
  preferences: {
    autoSave: false,
    showTimestamps: true,
    compactMode: false
  }
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

    // Enhanced UI actions
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<UiState['notifications'][0], 'id' | 'timestamp'>>) => {
      state.notifications.push({
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    updatePreferences: (state, action: PayloadAction<Partial<UiState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

  }
});

export const {
  setActiveTab,
  setCurrentRequestId,
  setIsLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  updatePreferences
} = uiSlice.actions;

// UI Selectors
export const selectUi = (state: RootState) => state.ui;
export const selectActiveTab = (state: RootState) => state.ui.activeTab;
export const selectCurrentRequestId = (state: RootState) => state.ui.currentRequestId;
export const selectIsLoading = (state: RootState) => state.ui.isLoading;
export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectPreferences = (state: RootState) => state.ui.preferences;

// Memoized selectors
export const selectRecentNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.slice(-5).reverse() // Last 5 notifications, newest first
);

export const selectHasActiveNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.length > 0
);

export default uiSlice.reducer;
