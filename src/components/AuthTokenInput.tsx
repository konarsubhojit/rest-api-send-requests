import React, { memo, useCallback, useState, useRef } from 'react';

interface AuthTokenInputProps {
  authToken: string;
  onAuthTokenChange: (token: string) => void;
}

/**
 * Authentication Token Input Component with progressive states
 */
export const AuthTokenInput = memo<AuthTokenInputProps>(({ 
  authToken, 
  onAuthTokenChange 
}) => {
  const [showToken, setShowToken] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTokenChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onAuthTokenChange(e.target.value);
  }, [onAuthTokenChange]);

  const toggleTokenVisibility = useCallback(() => {
    setShowToken(prev => !prev);
  }, []);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    setShowToken(false); // Reset to password mode when losing focus
  }, []);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    // Focus the input after state update
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  const hasToken = authToken.trim().length > 0;
  const shouldShowInput = !hasToken || isEditing;

  return (
    <div className="auth-token-container">
      <label htmlFor="auth" className="form-label fw-bold">Authorization (Bearer Token):</label>

      {shouldShowInput ? (
      // State 1: Default visible input OR State 2: Editing with password/toggle
        <div className="input-group">
          <input
            ref={inputRef}
            id="auth"
            type={hasToken && !showToken ? "password" : "text"}
            value={authToken}
            onChange={handleTokenChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter your bearer token (optional)"
            className="form-control"
            aria-describedby="auth-help"
            autoComplete="current-password"
          />
          {hasToken && (
            <button
              type="button"
              onClick={toggleTokenVisibility}
              className="btn btn-outline-secondary"
              aria-label={showToken ? "Hide authentication token" : "Show authentication token"}
              title={showToken ? "Hide token" : "Show token"}
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                {showToken ? (
                  // Eye slash icon (hide)
                  <>
                    <path d="M10.79 12.912l-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" />
                    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708a2.5 2.5 0 0 0-2.829-2.829l2.829 2.829zm3.171 6l-12-12 .708-.708 12 12-.708.708z" />
                  </>
                ) : (
                  // Eye icon (show)
                  <>
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                  </>
                )}
              </svg>
            </button>
          )}
        </div>
      ) : (
        // State 3: Token exists and not editing - show hidden display (clickable)
        <button
          type="button"
          className="auth-token-display auth-token-clickable"
          onClick={handleEditClick}
          aria-label="Click to edit authentication token"
          title="Click to edit token"
        >
          <span className="token-hidden">
            ●●●●●●●●●●●●●●●●●●●●
          </span>
        </button>
      )}

      <div id="auth-help" className="form-text">
        Optional: Enter your API authentication token
      </div>
    </div>
  );
});

AuthTokenInput.displayName = 'AuthTokenInput';
