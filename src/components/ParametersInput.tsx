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
              <div className="parameter-row row g-2 align-items-end">
                <div className="col-12 col-sm-5">
                  <input
                    type="text"
                    value={param.key}
                    onChange={handleParameterChange(index, 'key')}
                    placeholder="Key"
                    className="form-control"
                    aria-label={`Parameter ${index + 1} key`}
                  />
                </div>
                <div className="col-12 col-sm-5">
                  <input
                    type="text"
                    value={param.value}
                    onChange={handleParameterChange(index, 'value')}
                    placeholder="Value"
                    className="form-control"
                    aria-label={`Parameter ${index + 1} value`}
                  />
                </div>
                <div className="col-12 col-sm-2">
                  <button
                    type="button"
                    onClick={handleRemoveParameter(index)}
                    className="btn btn-outline-danger btn-remove-param w-100"
                    disabled={parameters.length === 1}
                    aria-label={`Remove parameter ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
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
