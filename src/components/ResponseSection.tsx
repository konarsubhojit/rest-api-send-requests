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
  if (responses.length === 0 && !loading) {
    return null;
  }

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
