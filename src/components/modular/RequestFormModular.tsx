import React from 'react';
import { UrlInput } from '../UrlInput';
import { ParametersInput } from '../ParametersInput';
import { HeadersInput } from '../HeadersInput';
import { BodyInput } from '../BodyInput';
import { MethodSelector } from './MethodSelector';
import { HTTP_METHODS } from '../../utils/constants';

/**
 * Clean Request Form - No More Unnecessary Abstractions!
 * Direct use of Redux-connected input components
 * Eliminates pointless wrapper/manager components
 */
export function RequestFormModular() {
  return (
    <>
      {/* Request Configuration */}
      <div className="mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">
                <i className="bi bi-globe me-2 text-primary" aria-hidden="true"></i>{' '}
                Request Configuration
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {/* Method Selection */}
                <div className="col-12 col-md-3">
                  <MethodSelector 
                    methods={HTTP_METHODS}
                  />
                </div>
                
                {/* URL Configuration */}
                <div className="col-12 col-md-9">
                  <UrlInput />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parameters Section */}
      <div className="mb-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom">
            <h5 className="card-title mb-0">
              <i className="bi bi-list-ul me-2 text-info" aria-hidden="true"></i>{' '}
              Parameters
            </h5>
          </div>
          <div className="card-body">
            <ParametersInput />
          </div>
        </div>
      </div>

      {/* Headers Section */}
      <div className="mb-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom">
            <h5 className="card-title mb-0">
              <i className="bi bi-code-square me-2 text-success" aria-hidden="true"></i>{' '}
              Headers
            </h5>
          </div>
          <div className="card-body">
            <HeadersInput />
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="mb-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom">
            <h5 className="card-title mb-0">
              <i className="bi bi-file-text me-2 text-warning" aria-hidden="true"></i>{' '}
              Request Body
            </h5>
          </div>
          <div className="card-body">
            <BodyInput />
          </div>
        </div>
      </div>
    </>
  );
}
