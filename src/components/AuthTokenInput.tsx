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
      {/* Authorize Button - Always Visible */}
      <button
        type="button"
        onClick={toggleAuthDialog}
        className={`btn ${hasToken ? 'btn-success' : 'btn-outline-primary'} btn-sm`}
        title={hasToken ? 'Bearer token configured - Click to modify' : 'Configure authorization'}
      >
        <i className="bi bi-shield-lock me-1" aria-hidden="true"></i>
        {hasToken ? 'Authorized' : 'Authorize'}
      </button>

      {/* Token Configuration Modal/Panel */}
      {isOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="bg-white rounded shadow-lg p-4" style={{ minWidth: '400px', maxWidth: '500px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Configure Authorization</h5>
              <button
                type="button"
                onClick={cancelToken}
                className="btn-close"
                aria-label="Close"
              ></button>
            </div>

            <div className="mb-3">
              <label htmlFor="auth-token" className="form-label fw-semibold">
                Bearer Token
              </label>
              <div className="position-relative">
                <input
                  ref={inputRef}
                  id="auth-token"
                  type={showPassword ? "text" : "password"}
                  value={draftToken}
                  onChange={handleTokenChange}
                  placeholder="Enter your bearer token..."
                  className="form-control"
                  style={{ paddingRight: '40px' }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="btn btn-link position-absolute"
                  style={{
                    top: '50%',
                    right: '8px',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    padding: '4px',
                    border: 'none',
                    background: 'none',
                    color: '#6c757d',
                    textDecoration: 'none'
                  }}
                  aria-label={showPassword ? "Hide token" : "Show token"}
                  title={showPassword ? "Hide token" : "Show token"}
                >
                  <i
                    className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}
                    style={{ fontSize: '16px' }}
                    aria-hidden="true"
                  ></i>
                </button>
              </div>
              <div className="form-text">
                This token will be sent as Authorization: Bearer {'{token}'} header
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-end pt-3 mt-3 border-top">
              <button
                type="button"
                onClick={cancelToken}
                className="btn btn-secondary"
                style={{ minWidth: '80px' }}
              >
                Cancel
              </button>
              {hasToken && (
                <button
                  type="button"
                  onClick={clearToken}
                  className="btn btn-outline-danger"
                  style={{ minWidth: '80px' }}
                >
                  <i className="bi bi-x me-1" aria-hidden="true"></i>
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={applyToken}
                className="btn btn-primary"
                disabled={!draftToken.trim()}
                style={{ minWidth: '80px' }}
              >
                <i className="bi bi-check me-1" aria-hidden="true"></i>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AuthTokenInput.displayName = 'AuthTokenInput';
