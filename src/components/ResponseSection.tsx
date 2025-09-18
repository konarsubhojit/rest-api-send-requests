import React from 'react';
import { ResponseDisplay } from './ResponseDisplay';
import { ApiResponse } from '../types/api';

interface ResponseSectionProps {
  responses: ApiResponse[];
  loading: boolean;
}

/**
 * Response Section Component
 * Handles displaying all API responses
 */
export function ResponseSection({ responses, loading }: ResponseSectionProps) {
  console.log('📊 ResponseSection render - responses:', responses.length, 'loading:', loading);

  return (
    <div className="mt-4">
      {loading && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center p-4">
            <div className="spinner-border text-primary me-2" role="status" aria-hidden="true"></div>
            <span>Sending request...</span>
          </div>
        </div>
      )}
      
      {responses.length === 0 && !loading && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center p-4 text-muted">
            <i className="bi bi-info-circle me-2"></i>
            No requests sent yet. Enter a URL and click "Send Request" to see the response here.
          </div>
        </div>
      )}

      {responses.map((response, index) => (
        <div key={`response-${index}-${response.timestamp}`} className="mb-3">
          <ResponseDisplay 
            response={response} 
            index={index}
            isLatest={index === responses.length - 1}
          />
        </div>
      ))}
    </div>
  );
}
