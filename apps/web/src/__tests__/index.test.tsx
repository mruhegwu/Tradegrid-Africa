import Home from '../pages/index';
import { render, screen } from '@testing-library/react';

describe('Home page', () => {
  it('renders the welcome heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Welcome to Tradegrid Africa'
    );
  });
});
