import React, { memo, useCallback, useState, useRef } from 'react';

interface AuthTokenInputProps {
  authToken: string;
  onAuthTokenChange: (token: string) => void;
}

/**
 * Swagger-style Authentication Component with Authorize button
 */
export const AuthTokenInput = memo<AuthTokenInputProps>(({ 
  authToken, 
  onAuthTokenChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [draftToken, setDraftToken] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync draft token with auth token when dialog opens
  const handleTokenChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDraftToken(e.target.value);
  }, []);

  const toggleAuthDialog = useCallback(() => {
    setIsOpen(prev => {
      const newIsOpen = !prev;
      // Focus input when opening and sync draft token
      if (newIsOpen) {
        setDraftToken(authToken);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
      return newIsOpen;
    });
  }, [authToken]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const clearToken = useCallback(() => {
    onAuthTokenChange('');
    setDraftToken('');
    setIsOpen(false);
  }, [onAuthTokenChange]);

  const applyToken = useCallback(() => {
    onAuthTokenChange(draftToken);
    setIsOpen(false);
  }, [draftToken, onAuthTokenChange]);

  const cancelToken = useCallback(() => {
    setDraftToken(authToken); // Reset draft to current token
    setIsOpen(false);
  }, [authToken]);

  const hasToken = authToken.trim().length > 0;

  return (
    <div className="auth-container">
      <h6 className="text-muted mb-2">Authorization</h6>

      {/* Authorize Button - Always Visible */}
      <div className="d-flex align-items-center gap-2 mb-2">
        <button
          type="button"
          onClick={toggleAuthDialog}
          className={`btn ${hasToken ? 'btn-success' : 'btn-outline-primary'} btn-sm`}
          title="Configure authorization"
        >
          <i className="bi bi-shield-lock me-1" aria-hidden="true"></i>
          {hasToken ? 'Authorized' : 'Authorize'}
        </button>

        {hasToken && (
          <small className="text-success">
            <i className="bi bi-check-circle-fill me-1" aria-hidden="true"></i>
            Bearer token configured
          </small>
        )}
      </div>

      {/* Collapsible Token Input Section */}
      {isOpen && (
        <div className="auth-panel border rounded p-3 bg-light">
          <div className="mb-3">
            <label htmlFor="auth-token" className="form-label fw-semibold">
              Bearer Token
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-key text-muted" aria-hidden="true"></i>
              </span>
              <input
                ref={inputRef}
                id="auth-token"
                type={showPassword ? "text" : "password"}
                value={draftToken}
                onChange={handleTokenChange}
                placeholder="Enter your bearer token..."
                className="form-control"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="btn btn-outline-secondary"
                aria-label={showPassword ? "Hide token" : "Show token"}
                title={showPassword ? "Hide token" : "Show token"}
              >
                <i
                  className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
            <div className="form-text">
              This token will be sent as Authorization: Bearer {'{token}'} header
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={applyToken}
              className="btn btn-success btn-sm"
              disabled={!draftToken.trim()}
            >
              <i className="bi bi-check me-1" aria-hidden="true"></i>
              Apply
            </button>
            <button
              type="button"
              onClick={clearToken}
              className="btn btn-outline-danger btn-sm"
            >
              <i className="bi bi-x me-1" aria-hidden="true"></i>
              Clear
            </button>
            <button
              type="button"
              onClick={cancelToken}
              className="btn btn-secondary btn-sm ms-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

AuthTokenInput.displayName = 'AuthTokenInput';
