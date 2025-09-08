import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders clutch log header', () => {
  render(<App />);
  const linkElement = screen.getByText(/🏍️ Clutch Log/i);
  expect(linkElement).toBeInTheDocument();
});