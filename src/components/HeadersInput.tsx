import React, { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  updateHeader, 
  addHeader, 
  removeHeader 
} from '../store/slices/requestSlice';

// Common HTTP headers with suggestions
const COMMON_HEADERS = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Cache-Control',
  'Content-Type',
  'User-Agent',
  'X-API-Key',
  'X-Requested-With',
  'Origin',
  'Referer'
];

const CONTENT_TYPE_VALUES = [
  'application/json',
  'application/xml',
  'application/x-www-form-urlencoded',
  'text/plain',
  'text/html',
  'multipart/form-data'
];

/**
 * Headers Input Component - Redux Connected
 * No props needed! Connects directly to Redux store
 */
export const HeadersInput = memo(() => {
  const dispatch = useAppDispatch();
  const { headers } = useAppSelector(state => state.request);

  const handleHeaderChange = useCallback((index: number, field: 'key' | 'value') => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(updateHeader({ index, field, value: e.target.value }));
    }, [dispatch]);

  const handleAddHeader = useCallback(() => {
    const newHeader = { 
      id: crypto.randomUUID(), 
      key: '', 
      value: '' 
    };
    dispatch(addHeader(newHeader));
  }, [dispatch]);

  const handleRemoveHeader = useCallback((index: number) => () => {
    dispatch(removeHeader(index));
  }, [dispatch]);

  const getValueSuggestions = useCallback((headerKey: string) => {
    const key = headerKey.toLowerCase();
    if (key === 'content-type') {
      return CONTENT_TYPE_VALUES;
    }
    if (key === 'accept') {
      return CONTENT_TYPE_VALUES;
    }
    if (key === 'cache-control') {
      return ['no-cache', 'no-store', 'must-revalidate', 'public', 'private'];
    }
    return [];
  }, []);

  return (
    <div className="mb-3">
      <h6 className="text-muted mb-2">HTTP Headers</h6>
      {headers.length > 0 ? (
        <div className="headers-list">
          {headers.map((header, index) => (
            <div key={header.id} className="mb-2">
              <div className="header-row input-group">
                <input
                  type="text"
                  value={header.key}
                  onChange={handleHeaderChange(index, 'key')}
                  placeholder="Header name"
                  className="form-control"
                  aria-label={`Header ${index + 1} name`}
                  list={`header-names-${index}`}
                />
                <datalist id={`header-names-${index}`}>
                  {COMMON_HEADERS.map(headerName => (
                    <option key={headerName} value={headerName} />
                  ))}
                </datalist>
                <input
                  type="text"
                  value={header.value}
                  onChange={handleHeaderChange(index, 'value')}
                  placeholder="Header value"
                  className="form-control"
                  aria-label={`Header ${index + 1} value`}
                  list={`header-values-${index}`}
                />
                <datalist id={`header-values-${index}`}>
                  {getValueSuggestions(header.key).map(value => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={handleRemoveHeader(index)}
                  className="btn btn-outline-danger"
                  disabled={headers.length === 1}
                  aria-label={`Remove header ${index + 1}`}
                  title="Remove header"
                >
                  <i className="bi bi-x" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      
      <button 
        type="button" 
        onClick={handleAddHeader} 
        className="btn btn-outline-success btn-sm"
        aria-label="Add new header"
      >
        <i className="bi bi-plus me-1" aria-hidden="true"></i>
        Add Header
      </button>
    </div>
  );
});

HeadersInput.displayName = 'HeadersInput';
