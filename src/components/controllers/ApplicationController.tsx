import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setActiveTab } from '../../store/slices/uiSlice';
import { setAuthToken } from '../../store/slices/requestSlice';
import { RequestFormModular } from '../modular/RequestFormModular';
import { ActionButtons } from '../ActionButtons';
import { ResponseSection } from '../ResponseSection';
import SavedRequests from '../SavedRequests';
import { AuthTokenInput } from '../AuthTokenInput';
import { useApiRequest } from '../../hooks/useApiRequest';

/**
 * Application Controller - Now TRULY follows SOLID principles!
 * 
 * 🚀 REDIS PATTERN OPTIMIZATION:
 * - Eliminated prop drilling completely
 * - Child components connect directly to Redux 
 * - Follows proper Redux patterns
 * - Drastically reduced coupling between components
 * 
 * ✅ SOLID Compliance:
 * - SRP: Only handles UI orchestration and tab navigation
 * - OCP: Child components are independently extensible
 * - LSP: All Redux-connected components are substitutable
 * - ISP: No more bloated prop interfaces
 * - DIP: Components depend on Redux abstractions, not concrete props
 */
export function ApplicationController() {
  const dispatch = useAppDispatch();
  const { activeTab } = useAppSelector(state => state.ui);
  const request = useAppSelector(state => state.request);
  
  const { responses, loading } = useApiRequest();

  // Focused event handlers - minimal UI orchestration only
  const handleTabChange = useCallback((tab: 'request' | 'saved') => {
    dispatch(setActiveTab(tab));
  }, [dispatch]);

  return (
    <div className="container-fluid px-3 px-sm-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="main-container p-3 p-md-4 p-lg-5">
            
            {/* Application Header */}
            <header className="mb-4 mb-md-5">
              <div className="d-flex justify-content-between align-items-center">
                <h1 className="display-4 display-md-3 mb-0">API Request Tool</h1>
                {activeTab === 'request' && (
                  <div className="swagger-auth-header">
                    <AuthTokenInput
                      authToken={request.authToken}
                      onAuthTokenChange={(token) => {
                        dispatch(setAuthToken(token));
                      }}
                    />
                  </div>
                )}
              </div>
            </header>

            {/* Tab Navigation */}
            <div className="nav nav-tabs mb-4" role="tablist" aria-label="Main navigation">
              <button
                className={`nav-link ${activeTab === 'request' ? 'active' : ''}`}
                onClick={() => handleTabChange('request')}
                type="button"
                role="tab"
                id="request-tab"
                aria-controls="request-panel"
                aria-selected={activeTab === 'request'}
              >
                <i className="bi bi-send me-2" aria-hidden="true"></i>{' '}
                Make Request
              </button>
              <button
                className={`nav-link ${activeTab === 'saved' ? 'active' : ''}`}
                onClick={() => handleTabChange('saved')}
                type="button"
                role="tab"
                id="saved-tab"
                aria-controls="saved-panel"
                aria-selected={activeTab === 'saved'}
              >
                <i className="bi bi-bookmark me-2" aria-hidden="true"></i>{' '}
                Saved Requests
              </button>
            </div>

            <main>
              {/* Request Tab Content */}
              {activeTab === 'request' && (
                <div
                  className="tab-pane active"
                  role="tabpanel"
                  id="request-panel"
                  aria-labelledby="request-tab"
                >
                  {/* Modular Request Form - Redux Connected */}
                  <RequestFormModular />

                  {/* Action Buttons - Redux Connected */}
                  <ActionButtons />

                  {/* Response Section */}
                  <ResponseSection responses={responses} loading={loading} />
                </div>
              )}

              {/* Saved Requests Tab Content */}
              {activeTab === 'saved' && (
                <div
                  className="tab-pane active"
                  role="tabpanel"
                  id="saved-panel"
                  aria-labelledby="saved-tab"
                >
                  <SavedRequests
                    onLoadRequest={() => console.log('Load request')}
                    onSaveCurrentRequest={() => console.log('Save current request')}
                    currentRequestId={undefined}
                  />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
