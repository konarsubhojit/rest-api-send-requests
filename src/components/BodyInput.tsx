import React, { memo, useCallback, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setBodyType, setBodyContent } from '../store/slices/requestSlice';

export type BodyType = 'json' | 'xml' | 'form-data' | 'raw' | 'none';

/**
 * Request Body Editor Component - Redux Connected
 * No props needed! Connects directly to Redux store
 */
export const BodyInput = memo(() => {
  const dispatch = useAppDispatch();
  const { method, bodyType, bodyContent } = useAppSelector(state => state.request);
  const [jsonError, setJsonError] = useState<string>('');

  // Methods that support request bodies
  const methodsWithBody = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const showBodyEditor = methodsWithBody.includes(method);

  // Validate JSON when bodyType is 'json'
  useEffect(() => {
    if (bodyType === 'json' && bodyContent.trim()) {
      try {
        JSON.parse(bodyContent);
        setJsonError('');
      } catch (error) {
        setJsonError(error instanceof Error ? error.message : 'Invalid JSON format');
      }
    } else {
      setJsonError('');
    }
  }, [bodyContent, bodyType]);

  const handleBodyTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBodyType = e.target.value as BodyType;
    dispatch(setBodyType(newBodyType));

    // Set default content for different body types
    if (newBodyType === 'json' && !bodyContent.trim()) {
      dispatch(setBodyContent('{\n  \n}'));
    } else if (newBodyType === 'xml' && !bodyContent.trim()) {
      dispatch(setBodyContent('<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  \n</root>'));
    } else if (newBodyType === 'form-data' && !bodyContent.trim()) {
      dispatch(setBodyContent('key1=value1&key2=value2'));
    }
  }, [dispatch, bodyContent]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setBodyContent(e.target.value));
  }, [dispatch]);

  const formatJson = useCallback(() => {
    if (bodyType === 'json' && bodyContent.trim()) {
      try {
        const parsed = JSON.parse(bodyContent);
        const formatted = JSON.stringify(parsed, null, 2);
        dispatch(setBodyContent(formatted));
      } catch {
        // Don't format if JSON is invalid - error is already shown to user
        return;
      }
    }
  }, [bodyContent, bodyType, dispatch]);

  const getPlaceholder = useCallback(() => {
    switch (bodyType) {
      case 'json':
        return 'Enter JSON data...\n\nExample:\n{\n  "name": "John Doe",\n  "email": "john@example.com"\n}';
      case 'xml':
        return 'Enter XML data...\n\nExample:\n<?xml version="1.0"?>\n<user>\n  <name>John Doe</name>\n  <email>john@example.com</email>\n</user>';
      case 'form-data':
        return 'Enter form data...\n\nExample:\nname=John Doe&email=john@example.com';
      case 'raw':
        return 'Enter raw text data...';
      default:
        return 'Enter request body...';
    }
  }, [bodyType]);

  if (!showBodyEditor) {
    return (
      <div className="text-muted text-center py-4">
        <i className="bi bi-info-circle me-2" aria-hidden="true"></i>
        Request body is not applicable for {method} requests
      </div>
    );
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="text-muted mb-0">Request Body Configuration</h6>
        <div className="d-flex align-items-center gap-2">
          {bodyType === 'json' && bodyContent.trim() && (
            <button
              type="button"
              onClick={formatJson}
              className="btn btn-outline-secondary btn-sm"
              disabled={!!jsonError}
              title="Format JSON"
            >
              Format JSON
            </button>
          )}
          <select
            value={bodyType}
            onChange={handleBodyTypeChange}
            className="form-select form-select-sm body-type-selector"
            aria-label="Select body type"
          >
            <option value="none">No Body</option>
            <option value="json">JSON</option>
            <option value="xml">XML</option>
            <option value="form-data">Form Data</option>
            <option value="raw">Raw Text</option>
          </select>
        </div>
      </div>

      {bodyType !== 'none' && (
        <div className="body-editor-container">
          <textarea
            value={bodyContent}
            onChange={handleContentChange}
            placeholder={getPlaceholder()}
            className={`form-control body-editor ${jsonError ? 'is-invalid' : ''} ${bodyType === 'json' ? 'json-editor' : ''}`}
            rows={10}
            aria-label="Request body content"
            spellCheck={false}
          />
          {jsonError && (
            <div className="invalid-feedback">
              <strong>JSON Error:</strong> {jsonError}
            </div>
          )}
          {bodyType === 'json' && !jsonError && bodyContent.trim() && (
            <div className="form-text text-success">
              ✓ Valid JSON format
            </div>
          )}
          {bodyType === 'form-data' && (
            <div className="form-text">
              Format: key1=value1&key2=value2 (URL-encoded form data)
            </div>
          )}
        </div>
      )}

      {bodyType !== 'none' && (
        <div className="mt-2">
          <small className="text-muted">
            <strong>Content-Type:</strong> {getContentType(bodyType)}
          </small>
        </div>
      )}
    </>
  );
});

// Helper function to get content type for each body type
function getContentType(bodyType: BodyType): string {
  switch (bodyType) {
    case 'json':
      return 'application/json';
    case 'xml':
      return 'application/xml';
    case 'form-data':
      return 'application/x-www-form-urlencoded';
    case 'raw':
      return 'text/plain';
    default:
      return '';
  }
}

BodyInput.displayName = 'BodyInput';
