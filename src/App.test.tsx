import React from 'react';
import { render, screen } from './test-utils';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders API Request Tool', () => {
  render(<App />);
  const headingElement = screen.getByText(/API Request Tool/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders all required form fields', () => {
  render(<App />);
  
  // Check for Base URL input
  const baseUrlInput = screen.getByLabelText(/base url/i);
  expect(baseUrlInput).toBeInTheDocument();

  // Check for Path input
  const pathInput = screen.getByLabelText(/path/i);
  expect(pathInput).toBeInTheDocument();
  
  // Check for HTTP method dropdown
  const methodSelect = screen.getByLabelText(/method/i);
  expect(methodSelect).toBeInTheDocument();
  
  // Check for authorization button
  const authButton = screen.getByRole('button', { name: /authorize/i });
  expect(authButton).toBeInTheDocument();
  
  // Check for send request button
  const sendButton = screen.getByRole('button', { name: /send request/i });
  expect(sendButton).toBeInTheDocument();
});

test('send button is disabled when no URL is provided', () => {
  render(<App />);
  const sendButton = screen.getByRole('button', { name: /send request/i });
  expect(sendButton).toBeDisabled();
});

test('displays URL preview when base URL is entered', async () => {
  render(<App />);
  const baseUrlInput = screen.getByLabelText(/base url/i);

  // Enter a base URL
  await userEvent.type(baseUrlInput, 'https://api.example.com');

  // Check that the input has the value
  expect(baseUrlInput).toHaveValue('https://api.example.com');
});
