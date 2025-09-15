import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setMethod } from '../../store/slices/requestSlice';
import { HttpMethod } from '../../types/api';

/**
 * Method Selector Component - Pure Redux Connection
 * No prop drilling! Connects directly to Redux state
 */
interface MethodSelectorProps {
  methods: readonly HttpMethod[];
}

export function MethodSelector({ methods }: MethodSelectorProps) {
  const dispatch = useAppDispatch();
  const method = useAppSelector(state => state.request.method);

  const handleMethodChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMethod = e.target.value as HttpMethod;
    dispatch(setMethod(newMethod));
  }, [dispatch]);

  return (
    <div className="form-group">
      <label htmlFor="http-method" className="form-label fw-medium">
        Method
      </label>
      <select
        id="http-method"
        className="form-select"
        value={method}
        onChange={handleMethodChange}
        aria-describedby="method-help"
      >
        {methods.map(m => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <div id="method-help" className="form-text">
        Select the HTTP method for your request
      </div>
    </div>
  );
}
