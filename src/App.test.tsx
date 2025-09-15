import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders API Request Tool', () => {
  render(<App />);
  const headingElement = screen.getByText(/API Request Tool/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders all required form fields', () => {
  render(<App />);
  
  // Check for URL input
  const urlInput = screen.getByLabelText(/endpoint url/i);
  expect(urlInput).toBeInTheDocument();
  
  // Check for HTTP method dropdown
  const methodSelect = screen.getByLabelText(/http method/i);
  expect(methodSelect).toBeInTheDocument();
  
  // Check for authorization input
  const authInput = screen.getByLabelText(/authorization/i);
  expect(authInput).toBeInTheDocument();
  
  // Check for send request button
  const sendButton = screen.getByText(/send request/i);
  expect(sendButton).toBeInTheDocument();
});
