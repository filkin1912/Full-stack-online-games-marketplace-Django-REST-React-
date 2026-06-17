import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ results: [], count: 0 }),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders storefront navigation', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  expect(screen.getByText(/All Games/i)).toBeInTheDocument();
});
