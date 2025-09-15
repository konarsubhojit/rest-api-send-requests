import React, { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  updateParameter,
  addParameter,
  removeParameter
} from '../store/slices/requestSlice';

/**
 * Parameters Input Component - Redux Connected
 * No props needed! Connects directly to Redux store
 */
export const ParametersInput = memo(() => {
  const dispatch = useAppDispatch();
  const { parameters, method } = useAppSelector(state => state.request);

  const handleParameterChange = useCallback((index: number, field: 'key' | 'value') => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(updateParameter({ index, field, value: e.target.value }));
    }, [dispatch]);

  const handleAddParameter = useCallback(() => {
    const newParam = {
      id: crypto.randomUUID(),
      key: '',
      value: ''
    };
    dispatch(addParameter(newParam));
  }, [dispatch]);

  const handleRemoveParameter = useCallback((index: number) => () => {
    dispatch(removeParameter(index));
  }, [dispatch]);

  const isGetRequest = method === 'GET';
  const parameterType = isGetRequest ? 'URL Query Parameters' : 'JSON Body';

  return (
    <div className="mb-3">
      <h6 className="text-muted mb-2">
        {parameterType}
      </h6>
      {parameters.length > 0 ? (
        <div className="parameter-list">
          {parameters.map((param, index) => (
            <div key={param.id} className="mb-2">
              <div className="parameter-row input-group">
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
                  className="btn btn-outline-danger"
                  disabled={parameters.length === 1}
                  aria-label={`Remove parameter ${index + 1}`}
                  title="Remove parameter"
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
        onClick={handleAddParameter}
        className="btn btn-outline-success btn-sm"
          aria-label="Add new parameter"
        >
        <i className="bi bi-plus me-1" aria-hidden="true"></i>
        Add Parameter
      </button>
    </div>
  );
});

ParametersInput.displayName = 'ParametersInput';
