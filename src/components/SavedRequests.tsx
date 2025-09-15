import React, { useState, useEffect } from 'react';
import { SavedRequest } from '../types/api';
import { RequestStorageService } from '../utils/requestStorage';
import { CurlUtils } from '../utils/curlUtils';

interface SavedRequestsProps {
  onLoadRequest: (savedRequest: SavedRequest) => void;
  onSaveCurrentRequest: () => void;
  currentRequestId?: string;
}

const SavedRequests: React.FC<SavedRequestsProps> = ({
  onLoadRequest,
  onSaveCurrentRequest,
  currentRequestId
}) => {
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    favorites: true,
    recent: true,
    all: false
  });

  // Load saved requests on component mount
  useEffect(() => {
    loadSavedRequests();
  }, []);

  const loadSavedRequests = () => {
    const history = RequestStorageService.getHistory();
    setSavedRequests(history.requests);
  };

  const handleToggleFavorite = (requestId: string) => {
    RequestStorageService.toggleFavorite(requestId);
    loadSavedRequests();
  };

  const handleDeleteRequest = (requestId: string) => {
    if (window.confirm('Are you sure you want to delete this saved request?')) {
      RequestStorageService.deleteRequest(requestId);
      loadSavedRequests();
    }
  };

  const handleExportAsCurl = (savedRequest: SavedRequest) => {
    const { apiRequest } = RequestStorageService.savedToApiRequest(savedRequest);
    const curlCommand = CurlUtils.apiRequestToCurl(apiRequest, savedRequest.url);
    
    // Copy to clipboard
    navigator.clipboard.writeText(curlCommand).then(() => {
      alert('cURL command copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = curlCommand;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('cURL command copied to clipboard!');
    });
  };

  const handleLoadRequest = (savedRequest: SavedRequest) => {
    RequestStorageService.updateLastUsed(savedRequest.id);
    onLoadRequest(savedRequest);
    loadSavedRequests(); // Refresh to update "last used" timestamps
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all saved requests? This cannot be undone.')) {
      RequestStorageService.clearHistory();
      setSavedRequests([]);
    }
  };

  const handleExportHistory = () => {
    const exportData = RequestStorageService.exportHistory();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rest-api-requests-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = RequestStorageService.importHistory(content);
      if (success) {
        loadSavedRequests();
        alert('History imported successfully!');
      } else {
        alert('Failed to import history. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredRequests = savedRequests.filter(request => {
    const matchesSearch = !searchQuery || 
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFavoriteFilter = !showFavoritesOnly || request.isFavorite;
    
    return matchesSearch && matchesFavoriteFilter;
  });

  const favoriteRequests = filteredRequests.filter(r => r.isFavorite);
  const recentRequests = filteredRequests
    .filter(r => !r.isFavorite)
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 10);
  const allOtherRequests = filteredRequests
    .filter(r => !r.isFavorite)
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(10);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMethodBadgeClass = (method: string) => {
    const classes: Record<string, string> = {
      'GET': 'badge-success',
      'POST': 'badge-primary',
      'PUT': 'badge-warning',
      'DELETE': 'badge-danger',
      'PATCH': 'badge-info',
      'HEAD': 'badge-secondary',
      'OPTIONS': 'badge-dark'
    };
    return classes[method] || 'badge-secondary';
  };

  const RequestItem = ({ request }: { request: SavedRequest }) => (
    <div className={`saved-request-item ${request.id === currentRequestId ? 'current' : ''}`}>
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1 cursor-pointer" onClick={() => handleLoadRequest(request)}>
          <div className="d-flex align-items-center mb-1">
            <span className={`badge me-2 ${getMethodBadgeClass(request.method)}`}>
              {request.method}
            </span>
            <span className="fw-medium text-truncate">{request.name}</span>
            {request.isFavorite && (
              <i className="bi bi-star-fill text-warning ms-2"></i>
            )}
          </div>
          <div className="text-muted small text-truncate mb-1">{request.url}</div>
          {request.description && (
            <div className="text-muted small">{request.description}</div>
          )}
          <div className="text-muted small">
            Last used: {formatTimestamp(request.lastUsed)}
          </div>
          {request.tags.length > 0 && (
            <div className="mt-1">
              {request.tags.map(tag => (
                <span key={tag} className="badge bg-light text-muted me-1 small">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="d-flex gap-2 ms-3">
          <button
            className={`btn btn-sm ${request.isFavorite ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => handleToggleFavorite(request.id)}
            title={request.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <i className={`bi ${request.isFavorite ? 'bi-star-fill' : 'bi-star'}`}></i>
          </button>
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => handleExportAsCurl(request)}
            title="Export as cURL command"
          >
            <i className="bi bi-terminal"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDeleteRequest(request.id)}
            title="Delete request"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="saved-requests">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">
          <i className="bi bi-clock-history me-2"></i>
          Saved Requests
        </h3>
        <button
          className="btn btn-primary btn-sm"
          onClick={onSaveCurrentRequest}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Save Current
        </button>
      </div>

      {/* Search and filters */}
      <div className="row mb-3">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-4 d-flex gap-2">
          <button
            className={`btn btn-sm ${showFavoritesOnly ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <i className="bi bi-star"></i> Favorites Only
          </button>
        </div>
      </div>

      {/* Management buttons */}
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={handleExportHistory}>
          <i className="bi bi-download me-1"></i>Export
        </button>
        <label className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-upload me-1"></i>Import
          <input
            type="file"
            accept=".json"
            className="d-none"
            onChange={handleImportHistory}
          />
        </label>
        <button className="btn btn-outline-danger btn-sm" onClick={handleClearHistory}>
          <i className="bi bi-trash me-1"></i>Clear All
        </button>
      </div>

      {savedRequests.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-clock-history display-4 d-block mb-3 opacity-50"></i>
          <p>No saved requests yet.</p>
          <p className="small">Make a request and click "Save Current" to get started!</p>
        </div>
      ) : (
        <>
          {/* Favorites Section */}
          {favoriteRequests.length > 0 && (
            <div className="saved-requests-section mb-4">
              <div 
                className="section-header"
                onClick={() => toggleSection('favorites')}
              >
                <h5 className="mb-0 d-flex align-items-center">
                  <i className={`bi ${expandedSections.favorites ? 'bi-chevron-down' : 'bi-chevron-right'} me-2`}></i>
                  <i className="bi bi-star-fill text-warning me-2"></i>
                  Favorites ({favoriteRequests.length})
                </h5>
              </div>
              {expandedSections.favorites && (
                <div className="section-content">
                  {favoriteRequests.map(request => (
                    <RequestItem key={request.id} request={request} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Section */}
          {recentRequests.length > 0 && (
            <div className="saved-requests-section mb-4">
              <div 
                className="section-header"
                onClick={() => toggleSection('recent')}
              >
                <h5 className="mb-0 d-flex align-items-center">
                  <i className={`bi ${expandedSections.recent ? 'bi-chevron-down' : 'bi-chevron-right'} me-2`}></i>
                  <i className="bi bi-clock me-2"></i>
                  Recent ({recentRequests.length})
                </h5>
              </div>
              {expandedSections.recent && (
                <div className="section-content">
                  {recentRequests.map(request => (
                    <RequestItem key={request.id} request={request} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Other Requests Section */}
          {allOtherRequests.length > 0 && (
            <div className="saved-requests-section mb-4">
              <div 
                className="section-header"
                onClick={() => toggleSection('all')}
              >
                <h5 className="mb-0 d-flex align-items-center">
                  <i className={`bi ${expandedSections.all ? 'bi-chevron-down' : 'bi-chevron-right'} me-2`}></i>
                  <i className="bi bi-folder2 me-2"></i>
                  All Others ({allOtherRequests.length})
                </h5>
              </div>
              {expandedSections.all && (
                <div className="section-content">
                  {allOtherRequests.map(request => (
                    <RequestItem key={request.id} request={request} />
                  ))}
                </div>
              )}
            </div>
          )}

          {filteredRequests.length === 0 && searchQuery && (
            <div className="text-center text-muted py-4">
              <i className="bi bi-search display-4 d-block mb-3 opacity-50"></i>
              <p>No requests found matching "{searchQuery}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedRequests;
