import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: jest.fn()
    },
    from: jest.fn()
  }
}));

beforeEach(() => window.localStorage.clear());

test('opens the local workspace without authentication', async () => {
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Blind Letter Pairs' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
});

test('loads saved letter pairs from browser storage', async () => {
  const content = Array.from({ length: 26 }, () => Array(26).fill(''));
  const colors = Array.from({ length: 26 }, () => Array(26).fill('white'));
  content[0][1] = 'Baseball';

  window.localStorage.setItem(
    'memo_spreadsheet_data',
    JSON.stringify({ content, colors })
  );

  render(<App />);

  expect(await screen.findByRole('cell', { name: 'Baseball' })).toBeInTheDocument();
});
