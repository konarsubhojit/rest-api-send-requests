# GitHub Copilot Instructions

## Project Overview
Modern, accessible REST API testing tool using React 19, TypeScript, Redux Toolkit. Follows SOLID principles and design patterns for maintainable, scalable code.

## Tech Stack
- Frontend: React 19.x + TypeScript
- State: Redux Toolkit + RTK Query
- Styling: Bootstrap 5.3.2 + custom CSS
- Testing: Jest + React Testing Library
- Build: React Scripts 5.0.1
- Architecture: SOLID, modular design

## Code Architecture & Patterns
- **SOLID**: SRP (focused components), OCP (extensible strategies), LSP (interchangeable impls), ISP (minimal interfaces), DIP (abstractions over concretions)
- **Patterns**: Strategy (Auth/Body), Command (undo/redo), Factory (creation), Facade (ApiService), Composite (modular composition)
- **Redux**: No prop drilling; modular slices (requestSlice, uiSlice); async thunks; typed hooks (useAppDispatch, useAppSelector)

## Component Structure
- **Core**: ApplicationController (orchestrator), RequestFormModular (form), ActionButtons (send/export), ResponseSection (display), SavedRequests (templates)
- **Inputs**: UrlInput (parsing), AuthTokenInput (secure), ParametersInput (dynamic), HeadersInput (management), BodyInput (multi-type)
- **Utils**: ErrorBoundary, MethodSelector, ResponseDisplay

## Coding Standards
- **TS**: Strict types, interfaces first, generics, named exports
- **React**: Functional components + hooks; memoization (memo, useCallback, useMemo); custom hooks; error boundaries
- **Redux**: RTK createSlice/createAsyncThunk; normalized state; reselect selectors; typed hooks
- **Accessibility (WCAG 2.1)**: ARIA labels, keyboard nav, focus management, screen reader support
- **CSS**: Bootstrap utilities; minimal custom CSS; responsive, mobile-first

## File Organization
```
src/
├── components/ (UI: controllers/, modular/, [Name].tsx)
├── hooks/ (Custom React hooks)
├── services/ (Business logic: api/, auth/, commands/, interfaces/, request/)
├── store/ (Redux: slices/, thunks/, hooks.ts)
├── types/ (TS definitions)
└── utils/ (Utilities)
```

## API Integration
- **Request**: { baseUrl, path, method, authToken, parameters[], headers[], bodyType ('json'|'xml'|'form-data'|'raw'|'none'), bodyContent }
- **Response**: Status indicators, headers, formatted JSON, error handling

## Testing Guidelines
- **Strategy**: Unit (components/utils), integration (interactions), accessibility (WCAG), Redux (actions/reducers)
- **Tools**: Jest, React Testing Library, User Event; high coverage

## Development Workflow
- **Quality**: ESLint, formatting, TS compilation, tests pre-commit
- **Performance**: Optimized bundle; memoization; lazy loading; cached API calls

## Common Patterns
- **Component**:
  ```typescript
  import React, { useCallback } from 'react';
  import { useAppSelector, useAppDispatch } from '../store/hooks';
  interface Props { /* minimal props */ }
  export function Component({ ...props }: Props) {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selector);
    const handle = useCallback(() => { /* impl */ }, [deps]);
    return ( /* JSX with accessibility */ );
  }
  ```
- **Redux Slice**:
  ```typescript
  import { createSlice } from '@reduxjs/toolkit';
  interface State { /* shape */ }
  const slice = createSlice({ name: 'name', initialState, reducers: { /* sync */ }, extraReducers: builder => { /* async */ } });
  ```
- **Custom Hook**:
  ```typescript
  import { useCallback } from 'react';
  import { useAppDispatch, useAppSelector } from '../store/hooks';
  export function useHook() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selector);
    const action = useCallback(() => { /* logic */ }, [deps]);
    return { state, action };
  }
  ```

## Security & Compatibility
- **Security**: Secure tokens, input validation, CORS, safe errors
- **Browsers**: Chrome, Firefox, Safari, Edge; ES6+; React Scripts polyfills

Prioritizes maintainability, accessibility, performance.
- **RTK Patterns**: Use Redux Toolkit createSlice and createAsyncThunk
- **Normalized State**: Keep state flat and normalized
- **Selectors**: Use reselect for memoized selectors
- **Typed Hooks**: Always use typed useAppSelector and useAppDispatch

### Accessibility (WCAG 2.1)
- **ARIA Labels**: Proper semantic markup and labels
- **Keyboard Navigation**: Complete keyboard accessibility
- **Focus Management**: Logical tab order and focus indicators
- **Screen Reader Support**: Full screen reader compatibility

### CSS/Styling
- **Bootstrap Classes**: Use Bootstrap 5.3.2 utility classes
- **Custom CSS**: Minimal custom CSS in App.css
- **Responsive Design**: Mobile-first responsive approach
- **Theme Consistency**: Follow established color scheme and spacing

## File Organization

```
src/
├── components/              # UI Components
│   ├── controllers/         # High-level orchestrator components
│   ├── modular/            # Modular, reusable components
│   └── [ComponentName].tsx # Individual components
├── hooks/                  # Custom React hooks
├── services/               # Business logic services
│   ├── api/               # API service layer
│   ├── auth/              # Authentication strategies
│   ├── commands/          # Command pattern implementations
│   ├── interfaces/        # Service interfaces
│   └── request/           # Request building logic
├── store/                  # Redux store configuration
│   ├── slices/            # Redux slices
│   ├── thunks/            # Async thunks
│   └── hooks.ts           # Typed Redux hooks
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## API Integration

### Request Structure
```typescript
interface ApiRequest {
  baseUrl: string;
  path: string;
  method: HttpMethod;
  authToken: string;
  parameters: KeyValuePair[];
  headers: KeyValuePair[];
  bodyType: 'json' | 'xml' | 'form-data' | 'raw' | 'none';
  bodyContent: string;
}
```

### Response Handling
- **Status Visualization**: Clear success/error indicators
- **Header Display**: Complete response header information
- **Formatted Output**: Syntax-highlighted JSON responses
- **Error Management**: Comprehensive error handling

## Testing Guidelines

### Testing Strategy
- **Unit Tests**: Test individual components and utilities
- **Integration Tests**: Test component interactions
- **Accessibility Tests**: Test WCAG compliance
- **Redux Tests**: Test actions, reducers, and selectors

### Testing Tools
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **User Event**: User interaction testing
- **Coverage**: Maintain high test coverage

## Development Workflow

### Code Quality
- **Linting**: Follow ESLint configuration
- **Formatting**: Use consistent code formatting
- **Type Checking**: Ensure TypeScript compilation
- **Testing**: Run tests before commits

### Performance Considerations
- **Bundle Size**: Keep bundle size optimized
- **Memoization**: Use React optimization hooks appropriately
- **Lazy Loading**: Implement code splitting where beneficial
- **Network Requests**: Optimize API calls and caching

## Common Patterns

### Component Creation
```typescript
// Template for new components
import React, { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';

interface ComponentProps {
  // Define minimal, focused props
}

export function ComponentName({ ...props }: ComponentProps) {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selector);
  
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies]);

  return (
    // JSX with proper accessibility
  );
}
```

### Redux Slice Pattern
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SliceState {
  // State shape
}

const slice = createSlice({
  name: 'sliceName',
  initialState,
  reducers: {
    // Synchronous actions
  },
  extraReducers: (builder) => {
    // Async thunk handling
  }
});
```

### Custom Hook Pattern
```typescript
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export function useCustomHook() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selector);

  const action = useCallback(() => {
    // Hook logic
  }, [dependencies]);

  return { state, action };
}
```

## Security Considerations
- **Token Management**: Secure authentication token handling
- **Input Validation**: Validate all user inputs
- **CORS Handling**: Proper CORS configuration for API requests
- **Error Messages**: Avoid exposing sensitive information in errors

## Browser Compatibility
- **Modern Browsers**: Support for Chrome, Firefox, Safari, Edge
- **ES6+ Features**: Use modern JavaScript features
- **Polyfills**: Include necessary polyfills via React Scripts

This codebase prioritizes maintainability, accessibility, and performance while following established React and TypeScript best practices.
