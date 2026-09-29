import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders clutch log header', () => {
  render(<App />);
  const linkElement = screen.getByRole('heading', { name: /Clutch Log/i });
  expect(linkElement).toBeInTheDocument();
});
