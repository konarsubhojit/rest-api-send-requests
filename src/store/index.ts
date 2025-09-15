import { configureStore, Middleware } from '@reduxjs/toolkit';
import requestReducer from './slices/requestSlice';
import uiReducer from './slices/uiSlice';

// Development logging middleware
const loggerMiddleware: Middleware = (store) => (next) => (action: any) => {
  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();
  
  // Log significant state changes
  if (action?.type && (action.type.includes('request/') || action.type.includes('ui/'))) {
    console.group(`🔄 ${action.type}`);
    console.log('Payload:', action.payload);
    console.log('Prev State:', prevState);
    console.log('Next State:', nextState);
    console.groupEnd();
  }
  
  return result;
};

// Enhanced store configuration with better middleware
export const store = configureStore({
  reducer: {
    request: requestReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'request/sendApiRequest/fulfilled', // Ignore API responses as they may contain non-serializable data
        ],
        ignoredPaths: [
          'ui.notifications.timestamp', // Timestamps are fine
          'response.data', // API response data might not be serializable
        ],
      },
      immutableCheck: {
        warnAfter: 128, // Warn about large state objects
      },
    }).concat([
      // Add logging middleware in development
      ...(process.env.NODE_ENV === 'development' ? [loggerMiddleware] : []),
    ]),
  devTools: process.env.NODE_ENV === 'development' && {
    name: 'REST API Tool',
    trace: true,
    traceLimit: 25,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
