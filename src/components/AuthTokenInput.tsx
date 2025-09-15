import React, { memo, useCallback, useState } from 'react';

interface AuthTokenInputProps {
  authToken: string;
  onAuthTokenChange: (token: string) => void;
}

/**
 * Authentication Token Input Component with show/hide functionality
 */
export const AuthTokenInput = memo<AuthTokenInputProps>(({ 
  authToken, 
  onAuthTokenChange 
}) => {
  const [showToken, setShowToken] = useState(false);

  const handleTokenChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onAuthTokenChange(e.target.value);
  }, [onAuthTokenChange]);

  const toggleTokenVisibility = useCallback(() => {
    setShowToken(prev => !prev);
  }, []);

  const hasToken = authToken.trim().length > 0;

  return (
    <div className="auth-token-container">
      <label htmlFor="auth" className="form-label fw-bold">Authorization (Bearer Token):</label>
      {!showToken && hasToken ? (
        <div className="auth-token-display">
          <span className="token-hidden flex-grow-1" aria-label="Hidden authentication token">
            ●●●●●●●●●●●●●●●●
          </span>
          <button
            type="button"
            onClick={toggleTokenVisibility}
            className="btn btn-outline-secondary btn-sm btn-toggle-token"
            aria-label="Edit authentication token"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="input-group">
          <input
            id="auth"
            type="password"
            value={authToken}
            onChange={handleTokenChange}
            placeholder="Enter your bearer token (optional)"
            className="form-control"
            aria-describedby="auth-help"
            autoComplete="current-password"
          />
          {hasToken && (
            <button
              type="button"
              onClick={toggleTokenVisibility}
              className="btn btn-outline-secondary btn-toggle-token"
              aria-label="Hide authentication token"
            >
              Hide
            </button>
          )}
        </div>
      )}
      <div id="auth-help" className="form-text">
        Optional: Enter your API authentication token
      </div>
    </div>
  );
});

AuthTokenInput.displayName = 'AuthTokenInput';
