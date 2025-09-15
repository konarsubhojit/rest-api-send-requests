import React, { memo, useCallback } from 'react';
import { KeyValuePair, HttpMethod } from '../types/api';

interface ParametersInputProps {
  parameters: KeyValuePair[];
  method: HttpMethod;
  onParameterChange: (index: number, field: 'key' | 'value', value: string) => void;
  onAddParameter: () => void;
  onRemoveParameter: (index: number) => void;
}

/**
 * Parameters Input Component for handling key-value pairs
 */
export const ParametersInput = memo<ParametersInputProps>(({
  parameters,
  method,
  onParameterChange,
  onAddParameter,
  onRemoveParameter
}) => {
  const handleParameterChange = useCallback((index: number, field: 'key' | 'value') => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onParameterChange(index, field, e.target.value);
    }, [onParameterChange]);

  const handleRemoveParameter = useCallback((index: number) => () => {
    onRemoveParameter(index);
  }, [onRemoveParameter]);

  const isGetRequest = method === 'GET';
  const parameterType = isGetRequest ? 'URL Query Parameters' : 'JSON Body';

  return (
    <div className="mb-4">
      <label className="form-label fw-bold">
        Parameters ({parameterType}):
      </label>
      <fieldset className="border-0 p-0" aria-label={`${parameterType} list`}>
        <div className="row g-2">
          {parameters.map((param, index) => (
            <div key={param.id} className="col-12">
              <div className="parameter-row input-group input-group-sm d-sm-flex">
                <input
                  type="text"
                  value={param.key}
                  onChange={handleParameterChange(index, 'key')}
                  placeholder="Key"
                  className="form-control"
                  aria-label={`Parameter ${index + 1} key`}
                />
                <input
                  type="text"
                  value={param.value}
                  onChange={handleParameterChange(index, 'value')}
                  placeholder="Value"
                  className="form-control"
                  aria-label={`Parameter ${index + 1} value`}
                />
                <button
                  type="button"
                  onClick={handleRemoveParameter(index)}
                  className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                  disabled={parameters.length === 1}
                  aria-label={`Remove parameter ${index + 1}`}
                  title="Remove parameter"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      <div className="mt-3">
        <button 
          type="button" 
          onClick={onAddParameter} 
          className="btn btn-success btn-add-param"
          aria-label="Add new parameter"
        >
          + Add Parameter
        </button>
      </div>
    </div>
  );
});

ParametersInput.displayName = 'ParametersInput';
