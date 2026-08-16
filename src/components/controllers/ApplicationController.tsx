import React, { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setActiveTab } from '../../store/slices/uiSlice';
import { loadRequest, selectFullUrl, setAuthToken } from '../../store/slices/requestSlice';
import { RequestFormModular } from '../modular/RequestFormModular';
import { ActionButtons } from '../ActionButtons';
import { ResponseSection } from '../ResponseSection';
import SavedRequests from '../SavedRequests';
import { AuthTokenInput } from '../AuthTokenInput';
import { useApiRequest } from '../../hooks/useApiRequest';
import { ProxyToggle } from '../ProxyToggle';
import { RequestStorageService } from '../../utils/requestStorage';
import { SavedRequest } from '../../types/api';

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
  const fullUrl = useAppSelector(selectFullUrl);
  
  const {
    responses, loading, sendRequest, proxyAvailable, useProxy, setUseProxy
  } = useApiRequest();

  useEffect(() => {
    const sharedRequest = RequestStorageService.parseShareFragment(window.location.hash);
    if (sharedRequest) dispatch(loadRequest(sharedRequest));
  }, [dispatch]);

  // Focused event handlers - minimal UI orchestration only
  const handleTabChange = useCallback((tab: 'request' | 'saved') => {
    dispatch(setActiveTab(tab));
  }, [dispatch]);

  const handleLoadRequest = useCallback((savedRequest: SavedRequest) => {
    dispatch(loadRequest(RequestStorageService.savedToApiRequest(savedRequest).apiRequest));
    dispatch(setActiveTab('request'));
  }, [dispatch]);

  const handleSaveRequest = useCallback(() => {
    const name = window.prompt('Name this request:');
    if (!name?.trim()) return;
    RequestStorageService.saveRequest(
      RequestStorageService.apiRequestToSaved(request, fullUrl, name.trim())
    );
    alert('Request saved. Authorization values were replaced with placeholders.');
  }, [request, fullUrl]);

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

                  {proxyAvailable && (
                    <ProxyToggle enabled={useProxy} onChange={setUseProxy} />
                  )}

                  {/* Action Buttons - Redux Connected */}
                  <ActionButtons onSendRequest={sendRequest} loading={loading} />

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
                    onLoadRequest={handleLoadRequest}
                    onSaveCurrentRequest={handleSaveRequest}
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
